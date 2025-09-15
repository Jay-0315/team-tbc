package com.tbc.tbc.payments.service;


import com.tbc.tbc.payments.api.dto.RefundRequest;
import com.tbc.tbc.payments.api.dto.RefundResponse;
import com.tbc.tbc.payments.client.dto.TossCancelReq;
import com.tbc.tbc.payments.client.dto.TossPaymentRes;
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
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RefundService {

    private final RestClient tossRestClient;
    private final PaymentRepository paymentRepo;
    private final WalletRepository walletRepo;
    private final WalletLedgerRepository ledgerRepo;

    @Transactional
    public RefundResponse refund(RefundRequest req) {
        Payment payment = paymentRepo.findByOrderId(req.orderId())
                .orElseThrow(() -> new IllegalStateException("ORDER_NOT_FOUND"));

        if (!payment.getState().canTransitTo(PaymentState.REFUND_REQUESTED)) {
            throw new IllegalStateException("INVALID_STATE");
        }

        // 상태 전이: PAID -> REFUND_REQUESTED
        payment.setState(PaymentState.REFUND_REQUESTED);
        paymentRepo.save(payment);

        // 토스 환불 API 호출
        TossPaymentRes res = tossRestClient.post()
                .uri("/v1/payments/" + payment.getPaymentKey() + "/cancel")
                .body(new TossCancelReq(req.refundAmount(), req.reason()))
                .retrieve()
                .onStatus(HttpStatusCode::isError, (reqSpec, resp) -> {
                    try (var reader = new BufferedReader(new InputStreamReader(resp.getBody(), StandardCharsets.UTF_8))) {
                        String body = reader.lines().collect(Collectors.joining("\n"));
                        throw new IllegalStateException("TOSS_REFUND_FAILED: " + body);
                    }
        })
        .body(TossPaymentRes.class);

        // 상태 전이: REFUND_REQUESTED -> REFUNDED
        if (!payment.getState().canTransitTo(PaymentState.REFUNDED)) {
            throw new IllegalStateException("INVALID_STATE_TRANSITION");
        }
        payment.setState(PaymentState.REFUNDED);
        paymentRepo.save(payment);

        // Wallet 업데이트 (DEBIT 처리)
        Wallet wallet = walletRepo.findByUserIdForUpdate(payment.getUserId())
                .orElseThrow(() -> new IllegalStateException("WALLET_NOT_FOUND"));

        String idemKey = "REFUND:" + payment.getOrderId();
        if (ledgerRepo.findByIdempotencyKey(idemKey).isEmpty()) {
            WalletLedger ledger = WalletLedger.builder()
                    .walletId(wallet.getId())
                    .type(LedgerType.DEBIT)
                    .amount(req.refundAmount())
                    .reason("REFUND")
                    .refType("PAYMENT")
                    .refId(payment.getOrderId())
                    .idempotencyKey(idemKey)
                    .build();
            ledgerRepo.save(ledger);

            wallet.setBalance(wallet.getBalance() - req.refundAmount());
            walletRepo.save(wallet);
        }

        return new RefundResponse(
            payment.getOrderId(),
            payment.getState().name(),
            req.refundAmount(),
            wallet.getBalance()
        );
    }
}
