package com.tbc.payments.adapter.out.persistence.jpa.repository;

import com.tbc.payments.adapter.out.persistence.jpa.entity.WalletEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface WalletJpaRepository extends JpaRepository<WalletEntity, Long> {
    Optional<WalletEntity> findByUserId(Long userId);

    @Modifying
    @Query("update WalletEntity w set w.balance = w.balance + :delta where w.userId = :userId")
    int addBalance(@Param("userId") Long userId, @Param("delta") long delta);
}



