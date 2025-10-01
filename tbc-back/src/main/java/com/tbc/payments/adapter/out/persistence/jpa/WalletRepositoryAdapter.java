package com.tbc.payments.adapter.out.persistence.jpa;

import com.tbc.payments.adapter.out.persistence.jpa.entity.WalletEntity;
import com.tbc.payments.adapter.out.persistence.jpa.repository.WalletJpaRepository;
import com.tbc.payments.application.port.out.WalletRepositoryPort;
import com.tbc.payments.domain.model.Wallet;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class WalletRepositoryAdapter implements WalletRepositoryPort {
    private final WalletJpaRepository repo;

    @Override
    public Optional<Wallet> findByUserId(Long userId) {
        return repo.findByUserId(userId)
                .map(e -> new Wallet(e.getId(), e.getUserId(), e.getBalance(), e.getUpdatedAt()));
    }

    @Override
    public Wallet save(Wallet wallet) {
        WalletEntity e = WalletEntity.builder()
                .id(wallet.id())
                .userId(wallet.userId())
                .balance(wallet.balance())
                .build();
        WalletEntity saved = repo.save(e);
        return new Wallet(saved.getId(), saved.getUserId(), saved.getBalance(), saved.getUpdatedAt());
    }

    @Override
    public void updateBalance(Long userId, long delta) {
        int updated = repo.addBalance(userId, delta);
        if (updated == 0) {
            // create then add
            repo.save(WalletEntity.builder().userId(userId).balance(0L).build());
            repo.addBalance(userId, delta);
        }
    }
}



