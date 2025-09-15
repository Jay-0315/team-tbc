// Wallet Repository
package com.tbc.tbc.mypage.adapters.out.persistence.jpa;

import com.tbc.tbc.point.adapters.out.persistence.entity.WalletEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MyPageWalletRepository extends JpaRepository<WalletEntity, Long> {
    Optional<WalletEntity> findByUserId(Long userId);   // ✅ 필드명과 일치
}
