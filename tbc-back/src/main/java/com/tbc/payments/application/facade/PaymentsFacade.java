package com.tbc.payments.application.facade;

import com.tbc.payments.application.service.GroupPaymentService;
import com.tbc.payments.application.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentsFacade {
    private final WalletService walletService;
    private final GroupPaymentService groupPaymentService;

    public long getBalance(Long userId) { return walletService.getBalance(userId); }

    public void charge(Long userId, long amount) { walletService.charge(userId, amount); }

    public void joinPaidGroup(Long groupId, Long userId) { groupPaymentService.joinPaidGroup(groupId, userId); }

    public void settleGroup(Long groupId) { groupPaymentService.settleGroup(groupId); }
}



