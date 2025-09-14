package com.tbc_back.tbc_back.point.adapters.out.persistence;

import com.tbc_back.tbc_back.point.adapters.out.persistence.entity.WalletEntity;
import com.tbc_back.tbc_back.adapters.out.persistence.jpa.SpringDataWalletJpaRepository;
import com.tbc_back.tbc_back.domain.model.Wallet;
import com.tbc_back.tbc_back.domain.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class WalletPersistenceAdapter implements WalletRepository {

    private final SpringDataWalletJpaRepository jpa;

    private Wallet toDomain(WalletEntity e) {
        return new Wallet(
                e.getId(),      // Long
                e.getUserId(),  // Long
                e.getBalance()
        );
    }

    @Override
    public Optional<Wallet> findByUserId(Long userId) {
        return jpa.findByUserId(userId).map(this::toDomain);
    }

    @Override
    @Transactional
    public boolean atomicDeduct(Long walletId, long amount) {
        WalletEntity wallet = jpa.findById(walletId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found: " + walletId));

        if (wallet.getBalance() < amount) {
            return false;
        }

        wallet.setBalance(wallet.getBalance() - amount);
        jpa.save(wallet);
        return true;
    }
}
