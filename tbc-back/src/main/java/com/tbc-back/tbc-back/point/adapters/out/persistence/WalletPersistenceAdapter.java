package com.tbc_back.tbc_back.adapters.out.persistence;

import com.tbc_back.tbc_back.adapters.out.persistence.entity.WalletEntity;
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
        return new Wallet(e.getId(), e.getOwnerUserId(), e.getBalancePoints());
    }

    @Override
    public Optional<Wallet> findByOwnerUserId(String userId) {
        return jpa.findByOwnerUserId(userId).map(this::toDomain);
    }

    @Override
    @Transactional
    public boolean atomicDeduct(String walletId, long amount) {
        return jpa.deductBalance(walletId, amount) == 1;
    }
}
