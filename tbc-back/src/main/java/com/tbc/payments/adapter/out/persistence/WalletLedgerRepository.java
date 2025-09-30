package com.tbc.payments.adapter.out.persistence;

import com.tbc.payments.domain.wallet.WalletLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface WalletLedgerRepository extends JpaRepository<WalletLedger, Long> {
    // 멱등키 기반 중복 체크용
    Optional<WalletLedger> findByIdempotencyKey(String idempotencyKey);

    @Query("SELECT COALESCE(SUM(CASE WHEN l.type = 'CREDIT' THEN l.amount ELSE -l.amount END), 0) " +
            "FROM WalletLedger l WHERE l.walletId = :walletId")
    Long sumByWalletId(@Param("walletId") Long walletId);
}
