package com.tbc.tbc.payments.application.service;

import com.tbc.tbc.payments.adapter.in.web.dto.RefundRequest;
import com.tbc.tbc.payments.adapter.in.web.dto.RefundResponse;
import com.tbc.tbc.payments.adapter.out.client.dto.TossCancelReq;
import com.tbc.tbc.payments.application.port.in.RefundUseCase;
import com.tbc.tbc.payments.application.port.out.PaymentPersistencePort;
import com.tbc.tbc.payments.application.port.out.TossClientPort;
import com.tbc.tbc.payments.application.port.out.WalletLedgerPersistencePort;
import com.tbc.tbc.payments.application.port.out.WalletPersistencePort;
import com.tbc.tbc.payments.domain.payment.Payment;
import com.tbc.tbc.payments.domain.payment.PaymentState;
import com.tbc.tbc.payments.domain.wallet.LedgerType;
import com.tbc.tbc.payments.domain.wallet.Wallet;
import com.tbc.tbc.payments.domain.wallet.WalletLedger;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RefundService implements RefundUseCase {

    private final TossClientPort tossClientPort;
    private final PaymentPersistencePort paymentRepo;
    private final WalletPersistencePort walletRepo;
    private final WalletLedgerPersistencePort ledgerRepo;

    @Transactional
    public RefundResponse refund(RefundRequest req) {
        Payment payment = paymentRepo.findByOrderId(req.orderId())
                .orElseThrow(() -> new IllegalStateException("ORDER_NOT_FOUND"));

        if (!payment.getState().canTransitTo(PaymentState.REFUND_REQUESTED)) {
            throw new IllegalStateException("INVALID_STATE");
        }

        // 상태 전이: PAID -> REFUND_REQUESTED
        payment.setState(PaymentState.REFUND_REQUESTED);
        paymentRepo.savePayment(payment);

        // 토스 환불 API 호출
        tossClientPort.cancel(payment.getPaymentKey(), new TossCancelReq(req.refundAmount(), req.reason()));

        // 상태 전이: REFUND_REQUESTED -> REFUNDED
        if (!payment.getState().canTransitTo(PaymentState.REFUNDED)) {
            throw new IllegalStateException("INVALID_STATE_TRANSITION");
        }
        payment.setState(PaymentState.REFUNDED);
        paymentRepo.savePayment(payment);

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
            ledgerRepo.saveLedger(ledger);

            wallet.setBalance(wallet.getBalance() - req.refundAmount());
            walletRepo.saveWallet(wallet);
        }

        return new RefundResponse(
                payment.getOrderId(),
                payment.getState().name(),
                req.refundAmount(),
                wallet.getBalance()
        );
    }
}