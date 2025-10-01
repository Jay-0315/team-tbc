package com.tbc.payments.application.service;

import com.tbc.payments.adapter.in.web.dto.RefundRequest;
import com.tbc.payments.adapter.in.web.dto.RefundResponse;
import com.tbc.payments.adapter.out.client.dto.TossCancelReq;
import com.tbc.payments.application.port.in.RefundUseCase;
import com.tbc.payments.application.port.out.PaymentPersistencePort;
import com.tbc.payments.application.port.out.TossClientPort;
import com.tbc.payments.application.port.out.WalletLedgerPersistencePort;
import com.tbc.payments.application.port.out.WalletPersistencePort;
import com.tbc.payments.domain.payment.Payment;
import com.tbc.payments.domain.payment.PaymentState;
import com.tbc.payments.domain.wallet.LedgerType;
import com.tbc.payments.domain.wallet.Wallet;
import com.tbc.payments.domain.wallet.WalletLedger;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RefundService implements RefundUseCase {

    private final TossClientPort tossClientPort;
    private final PaymentPersistencePort paymentRepository;
    private final WalletPersistencePort walletRepository;
    private final WalletLedgerPersistencePort ledgerRepository;

    @Transactional
    public RefundResponse refund(RefundRequest req) {
        Payment payment = paymentRepository.findByOrderId(req.orderId())
                .orElseThrow(() -> new IllegalStateException("ORDER_NOT_FOUND"));

        if (payment.getState() != PaymentState.PAID
                && payment.getState() != PaymentState.PARTIALLY_REFUNDED) {
            throw new IllegalStateException("ONLY_PAID_OR_PARTIALLY_REFUNDED_CAN_BE_REFUNDED");
        }

        // 토스 환불 API 호출
        tossClientPort.cancel(payment.getPaymentKey(), new TossCancelReq(req.refundAmount(), req.reason()));

        // Wallet 업데이트 (DEBIT 처리)
        Wallet wallet = walletRepository.findByUserIdForUpdate(payment.getUserId())
                .orElseThrow(() -> new IllegalStateException("WALLET_NOT_FOUND"));

        String idemKey = "REFUND:" + payment.getOrderId() + ":" + req.refundAmount() + ":" + req.reason();
        if (ledgerRepository.findByIdempotencyKey(idemKey).isEmpty()) {
            WalletLedger ledger = WalletLedger.builder()
                    .walletId(wallet.getId())
                    .type(LedgerType.DEBIT)
                    .amount(req.refundAmount())
                    .reason("REFUND_PARTIAL")
                    .refType("PAYMENT")
                    .refId(payment.getOrderId())
                    .idempotencyKey(idemKey)
                    .build();
            ledgerRepository.saveLedger(ledger);

            wallet.setBalance(wallet.getBalance() - req.refundAmount());
            walletRepository.saveWallet(wallet);
        }

        // 상태 관리: 단일 refundAmount 기준
        if (req.refundAmount() < payment.getAmount()) {
            payment.setState(PaymentState.PARTIALLY_REFUNDED);
        } else {
            payment.setState(PaymentState.REFUNDED);           // 전체 환불
        }
        paymentRepository.savePayment(payment);

        return new RefundResponse(
                payment.getOrderId(),
                payment.getState().name(),
                req.refundAmount(),
                wallet.getBalance()
        );
    }
}