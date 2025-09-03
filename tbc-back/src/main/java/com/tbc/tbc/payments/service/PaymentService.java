package com.tbc.tbc.payments.service;

import com.tbc.tbc.payments.api.dto.*;
import com.tbc.tbc.payments.client.dto.*;
import com.tbc.tbc.payments.domain.payment.*;
import com.tbc.tbc.payments.domain.wallet.*;
import com.tbc.tbc.payments.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final RestClient tossRestClient;
    private final PaymentRepository paymentRepository;
    private final WalletRepository walletRepository;
    private final WalletLedgerRepository ledgerRepository;

    @Transactional
    public CreatePaymentResponse createInit(CreatePaymentRequest req) {
        paymentRepository.findByOrderId(req.orderId()).ifPresent(p -> {
            throw new IllegalStateException("DUPLICATE_ORDER_ID");
        });

        Payment p = Payment.builder()
                .orderId(req.orderId())
                .userId(req.userId())
                .amount(req.amount())
                .state(PaymentState.INIT)
                .build();

        paymentRepository.save(p);
        return new CreatePaymentResponse(p.getOrderId());
    }

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

        // 2) Toss Confirm 호출
        TossPaymentRes res = tossRestClient.post()
                .uri("/v1/payments/confirm")
                .body(new TossConfirmReq(req.paymentKey(), req.orderId(), req.amount()))
                .retrieve()
                .onStatus(HttpStatusCode::isError, (reqSpec, resp) -> {
                    try (var reader = new BufferedReader(new InputStreamReader(resp.getBody(), StandardCharsets.UTF_8))) {
                        String body = reader.lines().collect(Collectors.joining("\n"));
                        throw new IllegalStateException("TOSS_CONFIRM_FAILED: " + body);
                    } catch (IOException e) {
                        throw new IllegalStateException("TOSS_CONFIRM_FAILED (no body)", e);
                    }
                })
                .body(TossPaymentRes.class);

        // status 검증 (DONE/SUCCESS 등 실제 응답값에 맞춰 조건 보강 가능)
        if (res == null || res.status() == null) {
            throw new IllegalStateException("INVALID_TOSS_RESPONSE");
        }
        String st = res.status().toUpperCase();
        if (!(st.equals("DONE") || st.equals("SUCCESS"))) {
            throw new IllegalStateException("PAYMENT_NOT_PAID_STATUS=" + res.status());
        }

        // 3) 상태 전이: INIT -> PAID
        payment.setPaymentKey(res.paymentKey());
        if (!payment.getState().canTransitTo(PaymentState.PAID)) {
            throw new IllegalStateException("INVALID_STATE_TRANSITION");
        }
        payment.setState(PaymentState.PAID);
        payment.setUpdatedAt(Instant.now());
        paymentRepository.save(payment);

        // 4) 지갑 잠금 후 CREDIT + 잔액 증가 (원샷 트랜잭션)
        Wallet wallet = walletRepository.findByUserIdForUpdate(payment.getUserId())
                .orElseThrow(() -> new IllegalStateException("WALLET_NOT_FOUND"));

        String idemKey = "TOPUP:" + payment.getOrderId();

        WalletLedger ledger = WalletLedger.builder()
                .walletId(wallet.getId())
                .type(LedgerType.CREDIT)
                .amount(payment.getAmount())
                .reason("TOPUP")
                .refType("PAYMENT")
                .refId(payment.getOrderId())
                .idempotencyKey(idemKey)
                .createdAt(Instant.now())
                .build();

        ledgerRepository.save(ledger);

        wallet.setBalance(wallet.getBalance() + payment.getAmount());
        wallet.setUpdatedAt(Instant.now());

        return new ConfirmResponse(payment.getOrderId(), payment.getState().name(),
                payment.getAmount(), wallet.getBalance());
    }
}
