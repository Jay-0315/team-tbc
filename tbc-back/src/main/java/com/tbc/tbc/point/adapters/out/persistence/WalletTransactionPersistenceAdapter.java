package com.tbc_back.tbc_back.adapters.out.persistence;

import com.tbc_back.tbc_back.adapters.out.persistence.entity.WalletTransactionEntity;
import com.tbc_back.tbc_back.adapters.out.persistence.jpa.SpringDataWalletTransactionJpaRepository;
import com.tbc_back.tbc_back.domain.model.WalletTransaction;
import com.tbc_back.tbc_back.domain.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WalletTransactionPersistenceAdapter implements WalletTransactionRepository {

    private final SpringDataWalletTransactionJpaRepository jpa;

    private WalletTransactionEntity toEntity(WalletTransaction d) {
        WalletTransactionEntity e = new WalletTransactionEntity();
        e.setId(d.getId());
        e.setWalletId(d.getWalletId());
        e.setType(d.getType().name());
        e.setStatus(d.getStatus().name());
        e.setAmountPoints(d.getAmountPoints());
        e.setMeetupId(d.getMeetupId());
        e.setCounterpartyWalletId(d.getCounterpartyWalletId());
        e.setExternalRef(d.getExternalRef());
        e.setDescription(d.getDescription());
        e.setCreatedAt(d.getCreatedAt());
        e.setSettledAt(d.getSettledAt());
        return e;
    }

    @Override
    public void save(WalletTransaction tx) {
        jpa.save(toEntity(tx));
    }
}
