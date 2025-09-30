package com.tbc.payments.application.service;

import com.tbc.payments.application.port.out.WalletRepositoryPort;
import com.tbc.payments.domain.model.Wallet;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WalletService {
    private final WalletRepositoryPort walletRepo;

    @Transactional(readOnly = true)
    public long getBalance(Long userId) {
        return walletRepo.findByUserId(userId).map(Wallet::balance).orElse(0L);
    }

    @Transactional
    public void charge(Long userId, long amount) {
        if (amount <= 0) throw new IllegalArgumentException("amount must be positive");
        walletRepo.updateBalance(userId, amount);
    }

    @Transactional
    public void debit(Long userId, long amount) {
        if (amount <= 0) throw new IllegalArgumentException("amount must be positive");
        long bal = getBalance(userId);
        if (bal < amount) throw new IllegalStateException("INSUFFICIENT_BALANCE");
        walletRepo.updateBalance(userId, -amount);
    }
}



