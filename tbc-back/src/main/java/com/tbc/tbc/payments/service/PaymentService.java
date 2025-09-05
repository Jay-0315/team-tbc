package com.tbc.tbc.payments.service;

import com.tbc.tbc.payments.api.dto.*;
import com.tbc.tbc.payments.client.dto.*;
import com.tbc.tbc.payments.domain.payment.*;
import com.tbc.tbc.payments.domain.wallet.*;
import com.tbc.tbc.payments.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final RestClient tossRestClient;
    private final PaymentRepository paymentRepository;
    private final WalletRepository walletRepository;
    private final WalletLedgerRepository ledgerRepository;
    private final WalletService walletService; // (선택) 위 2단계를 쓸 경우 주입

    /**
     * 결제 INIT: orderId 예약 + 사용자의 지갑 보장(없으면 생성)
     */
    @Transactional
    public CreatePaymentResponse createInit(CreatePaymentRequest req) {
        paymentRepository.findByOrderId(req.orderId()).ifPresent(p -> {
            throw new IllegalStateException("DUPLICATE_ORDER_ID");
        });

        // 지갑 보장 (없으면 balance=0으로 생성)
        walletService.getOrCreate(req.userId());

        Payment p = Payment.builder()
                .orderId(req.orderId())
                .userId(req.userId())
                .amount(req.amount())
                .state(PaymentState.INIT)
                .build();

        paymentRepository.save(p);
        log.debug("INIT saved orderId={}, userId={}, amount={}", p.getOrderId(), p.getUserId(), p.getAmount());
        return new CreatePaymentResponse(p.getOrderId());
    }

    /**
     * Toss Confirm + 잔액 CREDIT + 원장 기록 (멱등)
     */
    @Transactional
    public ConfirmResponse confirmAndCredit(ConfirmRequest req) {
        // 1) 서버 원주문 확인 & 금액 대조
        Payment payment = paymentRepository.findByOrderId(req.orderId())
                .orElseThrow(() -> new IllegalArgumentException("ORDER_NOT_FOUND"));

        if (!payment.getAmount().equals(req.amount())) {
            throw new IllegalStateException("AMOUNT_MISMATCH");
        }

        // 멱등: 이미 PAID면 현재 잔액 리턴
        if (payment.getState() == PaymentState.PAID) {
            Wallet w = walletRepository.findByUserId(payment.getUserId())
                    .orElseThrow(() -> new IllegalStateException("WALLET_NOT_FOUND"));
            return new ConfirmResponse(payment.getOrderId(), payment.getState().name(),
                    payment.getAmount(), w.getBalance());
        }

        // 2) Toss Confirm 호출 (실패시 상세 바디 포함하여 예외)
        TossPaymentRes res = tossRestClient.post()
                .uri("/v1/payments/confirm")
                .body(new TossConfirmReq(req.paymentKey(), req.orderId(), req.amount()))
                .retrieve()
                .onStatus(HttpStatusCode::isError, (reqSpec, resp) -> {
                    try (var reader = new BufferedReader(new InputStreamReader(resp.getBody(), StandardCharsets.UTF_8))) {
                        String body = reader.lines().collect(java.util.stream.Collectors.joining("\n"));
                        throw new IllegalStateException("TOSS_CONFIRM_FAILED: " + body);
                    } catch (IOException e) {
                        throw new IllegalStateException("TOSS_CONFIRM_FAILED (no body)", e);
                    }
                })
                .body(TossPaymentRes.class);

        if (res == null || res.status() == null) {
            throw new IllegalStateException("INVALID_TOSS_RESPONSE");
        }
        String st = res.status().toUpperCase();
        if (!(st.equals("DONE") || st.equals("SUCCESS"))) {
            throw new IllegalStateException("PAYMENT_NOT_PAID_STATUS=" + res.status());
        }

        // 3) 상태 전이: INIT -> PAID
        if (!payment.getState().canTransitTo(PaymentState.PAID)) {
            throw new IllegalStateException("INVALID_STATE_TRANSITION");
        }
        payment.setPaymentKey(res.paymentKey());
        payment.setState(PaymentState.PAID);
        paymentRepository.save(payment);
        log.debug("PAYMENT PAID orderId={}, paymentKey={}", payment.getOrderId(), payment.getPaymentKey());

        // 4) 지갑 잠금 후 CREDIT + 원장 기록 (멱등)
        Wallet wallet = walletRepository.findByUserIdForUpdate(payment.getUserId())
                .orElseThrow(() -> new IllegalStateException("WALLET_NOT_FOUND"));

        String idemKey = "TOPUP:" + payment.getOrderId();

        try {
            WalletLedger ledger = WalletLedger.builder()
                    .walletId(wallet.getId())
                    .type(LedgerType.CREDIT)
                    .amount(payment.getAmount())
                    .reason("TOPUP")
                    .refType("PAYMENT")
                    .refId(payment.getOrderId())
                    .idempotencyKey(idemKey)
                    .build(); // created_at/updated_at은 Auditing이 자동 세팅

            ledgerRepository.save(ledger);

            wallet.setBalance(wallet.getBalance() + payment.getAmount());
            // updated_at도 Auditing이 자동 갱신됨 (수동 set 필요X)

        } catch (DataIntegrityViolationException dup) {
            // 멱등키 UNIQUE 충돌 → 이미 크레딧된 상태로 간주하고 현재 잔액만 반환
            log.warn("Idempotent ledger hit for orderId={}, key={}", payment.getOrderId(), idemKey);
        }

        return new ConfirmResponse(payment.getOrderId(), payment.getState().name(),
                payment.getAmount(), wallet.getBalance());
    }
}
