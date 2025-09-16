package com.tbc.tbc.payments.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tbc.tbc.payments.domain.payment.Payment;
import com.tbc.tbc.payments.domain.payment.PaymentState;
import com.tbc.tbc.payments.domain.webhook.WebhookEvent;
import com.tbc.tbc.payments.domain.webhook.WebhookStatus;
import com.tbc.tbc.payments.domain.wallet.LedgerType;
import com.tbc.tbc.payments.domain.wallet.Wallet;
import com.tbc.tbc.payments.domain.wallet.WalletLedger;
import com.tbc.tbc.payments.application.port.out.PaymentPersistencePort;
import com.tbc.tbc.payments.application.port.out.WebhookEventPersistencePort;
import com.tbc.tbc.payments.application.port.out.WalletLedgerPersistencePort;
import com.tbc.tbc.payments.application.port.out.WalletPersistencePort;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentWebhookService {

    private final ObjectMapper objectMapper;
    private final WebhookEventPersistencePort eventRepo;
    private final PaymentPersistencePort paymentRepo;
    private final WalletPersistencePort walletRepo;
    private final WalletLedgerPersistencePort ledgerRepo;

    /** 1) 수신 저장 (멱등: eventId로 중복 방지) */
    @Transactional
    public void ingest(String headerEventId, String headerEventType, String payloadJson) {
        String eventId = safeExtractEventId(payloadJson, headerEventId);
        String eventType = safeExtractEventType(payloadJson, headerEventType);

        if (eventId == null) throw new IllegalArgumentException("WEBHOOK_EVENT_ID_MISSING");

        if (eventRepo.findByEventId(eventId).isPresent()) {
            log.info("[WH] duplicate eventId={}, skip store", eventId);
            return;
        }

        WebhookEvent e = WebhookEvent.builder()
                .eventId(eventId)
                .eventType(eventType != null ? eventType : "UNKNOWN")
                .payload(payloadJson) // ★ JSON 문자열 그대로 저장
                .receivedAt(LocalDateTime.now())
                .status(WebhookStatus.PENDING)
                .attemptCount(0)
                .build();

        eventRepo.save(e);
        log.info("[WH] stored eventId={} type={}", eventId, eventType);

        // 즉시 처리(선호 시), 또는 비동기/스케줄러에 맡겨도 됨
        try {
            process(e);
        } catch (Exception ex) {
            log.error("[WH] immediate process failed: {}", e.getEventId(), ex);
        }
    }

    private String safeExtractEventId(String raw, String fallback) {
        try {
            JsonNode root = objectMapper.readTree(raw);
            String v = text(root, "eventId");
            if (v == null) v = text(root, "id");
            return v != null ? v : fallback;
        } catch (Exception e) {
            return fallback;
        }
    }

    private String safeExtractEventType(String raw, String fallback) {
        try {
            JsonNode root = objectMapper.readTree(raw);
            String v = text(root, "eventType");
            if (v == null) v = text(root, "type");
            return v != null ? v : fallback;
        } catch (Exception e) {
            return fallback;
        }
    }

    private String text(JsonNode n, String field) {
        JsonNode x = n.get(field);
        return (x != null && !x.isNull()) ? x.asText() : null;
    }

    /** 2) 실제 처리 (재시도에서도 동일 호출) */
    @Transactional
    public void process(WebhookEvent e) throws Exception {
        e.setAttemptCount(e.getAttemptCount() + 1);

        // 2-1) DTO 파싱
        WebhookEventDto dto = objectMapper.readValue(e.getPayload(), WebhookEventDto.class);
        String type = (dto.eventType != null) ? dto.eventType : "UNKNOWN";

        // 2-2) 타입별 분기
        if ("PAYMENT_STATUS_CHANGED".equalsIgnoreCase(type)) {
            handlePaymentStatusChanged(dto);
        } else {
            log.info("[WH] ignore type={}", type);
        }
    }

    /** 결제 상태 변경 처리 (DONE / CANCELED 등) */
    private void handlePaymentStatusChanged(WebhookEventDto dto) {
        if (dto.data == null) throw new IllegalArgumentException("MISSING_DATA");
        String orderId = dto.data.orderId;
        String status  = dto.data.status; // DONE, CANCELED, PARTIAL_CANCELED ...
        String paymentKey = dto.data.paymentKey;

        Payment payment = paymentRepo.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalStateException("ORDER_NOT_FOUND in webhook"));

        if ("DONE".equalsIgnoreCase(status)) {
            // INIT → PAID 전이 + 잔액 적립(멱등)
            if (payment.getState() == PaymentState.INIT && payment.getState().canTransitTo(PaymentState.PAID)) {
                payment.setState(PaymentState.PAID);
                if (paymentKey != null) payment.setPaymentKey(paymentKey);
                paymentRepo.savePayment(payment);

                Wallet wallet = walletRepo.findByUserIdForUpdate(payment.getUserId())
                        .orElseThrow(() -> new IllegalStateException("WALLET_NOT_FOUND"));

                String idemKey = "WH:TOPUP:" + payment.getOrderId();
                if (ledgerRepo.findByIdempotencyKey(idemKey).isEmpty()) {
                    WalletLedger ledger = WalletLedger.builder()
                            .walletId(wallet.getId())
                            .type(LedgerType.CREDIT)
                            .amount(payment.getAmount())
                            .reason("TOPUP")
                            .refType("PAYMENT")
                            .refId(orderId)
                            .idempotencyKey(idemKey)
                            .build();
                    ledgerRepo.saveLedger(ledger);

                    wallet.setBalance(wallet.getBalance() + payment.getAmount());
                    walletRepo.saveWallet(wallet);
                }
            }
        } else if ("CANCELED".equalsIgnoreCase(status)) {
            // PAID → REFUNDED 전이 + 잔액 차감(멱등)
            if (payment.getState() == PaymentState.PAID && payment.getState().canTransitTo(PaymentState.REFUNDED)) {
                payment.setState(PaymentState.REFUNDED);
                paymentRepo.savePayment(payment);

                Wallet wallet = walletRepo.findByUserIdForUpdate(payment.getUserId())
                        .orElseThrow(() -> new IllegalStateException("WALLET_NOT_FOUND"));

                String idemKey = "WH:REFUND:" + payment.getOrderId();
                if (ledgerRepo.findByIdempotencyKey(idemKey).isEmpty()) {
                    WalletLedger ledger = WalletLedger.builder()
                            .walletId(wallet.getId())
                            .type(LedgerType.DEBIT)
                            .amount(payment.getAmount())
                            .reason("REFUND")
                            .refType("PAYMENT")
                            .refId(orderId)
                            .idempotencyKey(idemKey)
                            .build();
                    ledgerRepo.saveLedger(ledger);

                    wallet.setBalance(wallet.getBalance() - payment.getAmount());
                    walletRepo.saveWallet(wallet);
                }
            }
        }
        // PARTIAL_CANCELED 등은 이후 확장
    }

    /** 웹훅 DTO (ObjectMapper용) */
    @lombok.Data
    public static class WebhookEventDto {
        public String eventId;
        public String eventType;
        public Data data;

        @lombok.Data
        public static class Data {
            public String orderId;
            public String status;
            public String paymentKey;
        }
    }
}