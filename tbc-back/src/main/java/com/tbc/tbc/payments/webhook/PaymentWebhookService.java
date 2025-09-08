package com.tbc.tbc.payments.webhook;


import com.tbc.tbc.payments.domain.payment.Payment;
import com.tbc.tbc.payments.domain.payment.PaymentState;
import com.tbc.tbc.payments.domain.wallet.LedgerType;
import com.tbc.tbc.payments.domain.wallet.Wallet;
import com.tbc.tbc.payments.domain.wallet.WalletLedger;
import com.tbc.tbc.payments.repository.PaymentRepository;
import com.tbc.tbc.payments.repository.WalletLedgerRepository;
import com.tbc.tbc.payments.repository.WalletRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentWebhookService {

    private final WebhookEventRepository eventRepo;
    private final PaymentRepository paymentRepo;
    private final WalletRepository walletRepo;
    private final WalletLedgerRepository ledgerRepo;

    @Transactional
    public void ingest(String headerEventId, String headerEventType, Map<String, Object> payload) {
        String eventId = Optional.ofNullable(headerEventId).orElseGet(() -> extractEventId(payload));
        String eventType = Optional.ofNullable(headerEventType).orElseGet(() -> extractEventType(payload));

        if (eventId == null) throw new IllegalArgumentException("WEBHOOK_EVENT_ID_MISSING");

        if (eventRepo.findByEventId(eventId).isPresent()) {
            log.info("[WH] duplictaed eventId={}, skip", eventId);
            return;
        }

        WebhookEvent e = WebhookEvent.builder()
                .eventId(eventId)
                .eventType(eventType != null ? eventType : "UNKNOWN")
                .payload(payload)
                .receivedAt(LocalDateTime.now())
                .processed(false)
                .build();

        eventRepo.save(e);
        log.info("[WH] stored eventId={} type={}", eventId, eventType);
    }

    private String extractEventId(Map<String, Object> payload) {
        Object v = payload.get("eventId");
        if (v == null) v = payload.get("id");
        return v != null ? String.valueOf(v) : null;
    }

    private String extractEventType(Map<String, Object> payload) {
        Object v = payload.get("eventType");
        if (v == null) v = payload.get("type");
        return v != null ? String.valueOf(v) : null;
    }

    /** 나중에 Processor에서 불려서 상태 반영 */
    @Transactional
    public void process(WebhookEvent e) {
        log.info("[WH] processing eventId={} type={}", e.getEventId(), e.getEventType());

        Map<String, Object> payload = e.getPayload();
        String eventType = e.getEventType();

        // 1. 결제 성공 이벤트
        if ("PAYMENT_STATUS_CHANGED".equalsIgnoreCase(eventType)) {
            String orderId = String.valueOf(payload.get("orderId"));
            String status = String.valueOf(payload.get("status")); // e.g. DONE, CANCELED, PARTIAL_CANCELED

            Payment payment = paymentRepo.findByOrderId(orderId)
                    .orElseThrow(() -> new IllegalStateException("ORDER_NOT_FOUND in webhook"));

            if ("DONE".equalsIgnoreCase(status)) {
                // INIT → PAID 전이
                if (payment.getState() == PaymentState.INIT && payment.getState().canTransitTo(PaymentState.PAID)) {
                    payment.setState(PaymentState.PAID);
                    paymentRepo.save(payment);

                    // Wallet CREDIT
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
                        ledgerRepo.save(ledger);

                        wallet.setBalance(wallet.getBalance() + payment.getAmount());
                        walletRepo.save(wallet);
                    }
                }
            }
            else if ("CANCELED".equalsIgnoreCase(status)) {
                // PAID → REFUNDED 전이
                if (payment.getState() == PaymentState.PAID && payment.getState().canTransitTo(PaymentState.REFUNDED)) {
                    payment.setState(PaymentState.REFUNDED);
                    paymentRepo.save(payment);

                    // Wallet DEBIT (환불 처리)
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
                        ledgerRepo.save(ledger);

                        wallet.setBalance(wallet.getBalance() - payment.getAmount());
                        walletRepo.save(wallet);
                    }
                }
            }
        }

        // 2. 처리 완료 표시
        e.setProcessed(true);
        e.setProcessedAt(LocalDateTime.now());
    }

}
