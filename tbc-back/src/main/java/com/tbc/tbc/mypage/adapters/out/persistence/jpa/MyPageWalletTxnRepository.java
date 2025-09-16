package com.tbc.tbc.mypage.adapters.out.persistence.jpa;

import com.tbc.tbc.payments.domain.wallet.WalletLedger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MyPageWalletTxnRepository extends JpaRepository<WalletLedger, Long> {
    Page<WalletLedger> findByWalletIdOrderByCreatedAtDesc(Long walletId, Pageable pageable);
}