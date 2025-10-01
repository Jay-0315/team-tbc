package com.tbc.payments.adapter.out.persistence.jpa;

import com.tbc.payments.adapter.out.persistence.jpa.entity.WalletHoldEntity;
import com.tbc.payments.adapter.out.persistence.jpa.repository.WalletHoldJpaRepository;
import com.tbc.payments.application.port.out.WalletHoldRepositoryPort;
import com.tbc.payments.domain.model.WalletHold;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class WalletHoldRepositoryAdapter implements WalletHoldRepositoryPort {
    private final WalletHoldJpaRepository repo;

    @Override
    public WalletHold save(WalletHold hold) {
        WalletHoldEntity e = WalletHoldEntity.builder()
                .id(hold.id())
                .userId(hold.userId())
                .groupId(hold.groupId())
                .amount(hold.amount())
                .status(hold.status())
                .build();
        var saved = repo.save(e);
        return new WalletHold(saved.getId(), saved.getUserId(), saved.getGroupId(), saved.getAmount(), saved.getStatus(), saved.getCreatedAt(), saved.getUpdatedAt());
    }

    @Override
    public List<WalletHold> findActiveByGroupId(Long groupId) {
        return repo.findByGroupIdAndStatus(groupId, "HELD").stream()
                .map(e -> new WalletHold(e.getId(), e.getUserId(), e.getGroupId(), e.getAmount(), e.getStatus(), e.getCreatedAt(), e.getUpdatedAt()))
                .toList();
    }

    @Override
    public void captureByGroupId(Long groupId) {
        repo.captureByGroup(groupId);
    }

    @Override
    public void releaseByGroupId(Long groupId) {
        repo.releaseByGroup(groupId);
    }
}



