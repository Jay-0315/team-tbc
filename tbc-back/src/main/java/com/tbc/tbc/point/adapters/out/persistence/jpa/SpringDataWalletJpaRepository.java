package com.tbc_back.tbc_back.adapters.out.persistence.jpa;

import com.tbc_back.tbc_back.adapters.out.persistence.entity.WalletEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SpringDataWalletJpaRepository extends JpaRepository<WalletEntity, String> {
    Optional<WalletEntity> findByOwnerUserId(String ownerUserId);
}
