// Wallet Transaction Repository
package com.tbc_back.tbc_back.mypage.adapters.out.persistence.jpa;

import com.tbc_back.tbc_back.point.adapters.out.persistence.entity.WalletTransactionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MyPageWalletTxnRepository extends JpaRepository<WalletTransactionEntity, Long> {
    Page<WalletTransactionEntity> findByWalletIdOrderByCreatedAtDesc(Long walletId, Pageable pageable);
}
