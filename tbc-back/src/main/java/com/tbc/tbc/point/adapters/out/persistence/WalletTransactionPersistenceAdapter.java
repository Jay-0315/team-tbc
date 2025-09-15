package com.tbc.tbc.adapters.out.persistence;

import com.tbc.tbc.point.adapters.out.persistence.entity.WalletTransactionEntity;
import com.tbc.tbc.adapters.out.persistence.jpa.SpringDataWalletTransactionJpaRepository;
import com.tbc.tbc.point.domain.model.WalletTransaction;
import com.tbc.tbc.point.domain.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WalletTransactionPersistenceAdapter implements WalletTransactionRepository {

    private final SpringDataWalletTransactionJpaRepository jpa;

    private WalletTransactionEntity toEntity(WalletTransaction d) {
        WalletTransactionEntity e = new WalletTransactionEntity();

        // 🔥 ID / WalletId 는 Long 으로 매핑해야 함
        e.setId(d.getId() != null ? Long.valueOf(d.getId()) : null);
        e.setWalletId(d.getWalletId() != null ? Long.valueOf(d.getWalletId()) : null);

        e.setType(d.getType().name());            // DEBIT / CREDIT
        e.setReason(d.getDescription());          // 🔥 status 대신 reason 컬럼 사용
        e.setAmount(d.getAmount());         // ✅ Domain과 Entity 필드 맞춤
        e.setRefId(String.valueOf(d.getMeetupId())); // 🔥 Long → String 변환
        e.setIdempotencyKey(d.getExternalRef());  // 멱등 처리용 키
        e.setRefType("MEETUP");                   // 필요 시 고정값
        e.setCreatedAt(d.getCreatedAt());
        e.setUpdatedAt(d.getSettledAt());

        return e;
    }

    @Override
    public void save(WalletTransaction tx) {
        jpa.save(toEntity(tx));
    }
}
