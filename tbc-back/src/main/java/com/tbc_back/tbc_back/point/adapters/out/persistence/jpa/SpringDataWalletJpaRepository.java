package com.tbc_back.tbc_back.adapters.out.persistence.jpa;

import com.tbc_back.tbc_back.point.adapters.out.persistence.entity.WalletEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SpringDataWalletJpaRepository extends JpaRepository<WalletEntity, Long> {
    Optional<WalletEntity> findByUserId(Long userId);  // ✅ 수정
}

