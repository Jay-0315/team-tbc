package com.tbc.payments.application.port.out;

import com.tbc.payments.domain.model.Wallet;

import java.util.Optional;

public interface WalletRepositoryPort {
    Optional<Wallet> findByUserId(Long userId);
    Wallet save(Wallet wallet);
    void updateBalance(Long userId, long delta);
}



