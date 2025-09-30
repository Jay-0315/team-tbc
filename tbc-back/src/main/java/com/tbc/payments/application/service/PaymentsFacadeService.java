package com.tbc.payments.application.service;

import com.tbc.payments.adapter.in.web.dto.*;
import com.tbc.payments.application.port.in.PaymentUseCase;
import com.tbc.payments.application.port.in.PaymentsFacade;
import com.tbc.payments.application.port.in.RefundUseCase;
import com.tbc.payments.application.port.in.WalletUseCase;
import com.tbc.payments.domain.wallet.Wallet;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentsFacadeService implements PaymentsFacade {

    private final PaymentUseCase paymentUseCase;
    private final RefundUseCase refundUseCase;
    private final WalletUseCase walletUseCase;

    @Override
    public CreatePaymentResponse create(CreatePaymentRequest req) {
        return paymentUseCase.createInit(req);
    }

    @Override
    public ConfirmResponse confirm(ConfirmRequest req) {
        return paymentUseCase.confirmAndCredit(req);
    }

    @Override
    public RefundResponse refund(RefundRequest req) {
        return refundUseCase.refund(req);
    }

    @Override
    public CancelPaymentResponse cancelInit(String orderId) {
        var p = paymentUseCase.cancelInit(orderId);
        return new CancelPaymentResponse(p.getOrderId(), p.getState().name());
    }

    @Override
    public WalletBalanceResponse getWalletBalance(Long userId) {
        Wallet wallet = walletUseCase.getOrCreate(userId);
        return new WalletBalanceResponse(wallet.getUserId(), wallet.getBalance());
    }
}