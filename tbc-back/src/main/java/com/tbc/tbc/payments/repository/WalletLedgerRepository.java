package com.tbc.tbc.payments.repository;

import com.tbc.tbc.payments.domain.wallet.WalletLedger;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WalletLedgerRepository extends JpaRepository<WalletLedger, Long> {
    // 멱등키 기반 중복 체크용
    Optional<WalletLedger> findByIdempotencyKey(String idempotencyKey);
}
