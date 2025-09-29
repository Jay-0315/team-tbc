package com.tbc.payments.adapter.out.persistence;

import com.tbc.payments.application.port.out.WalletPersistencePort;
import com.tbc.payments.domain.wallet.Wallet;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class WalletPersistenceAdapter implements WalletPersistencePort {

    private final WalletRepository walletRepository;

    @Override
    public Optional<Wallet> findByUserId(Long userId) {
        return walletRepository.findByUserId(userId);
    }

    @Override
    public Optional<Wallet> findByUserIdForUpdate(Long userId) {
        return walletRepository.findByUserIdForUpdate(userId);
    }

    @Override
    public Wallet saveWallet(Wallet wallet) {
        return walletRepository.save(wallet);
    }

    @Override
    public List<Wallet> findAll() {
        return walletRepository.findAll();
    }
}