package com.tbc.payments.adapter.out.persistence.jpa.repository;

import com.tbc.payments.adapter.out.persistence.jpa.entity.WalletHoldEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WalletHoldJpaRepository extends JpaRepository<WalletHoldEntity, Long> {
    List<WalletHoldEntity> findByGroupIdAndStatus(Long groupId, String status);

    @Modifying
    @Query("update WalletHoldEntity h set h.status = 'CAPTURED' where h.groupId = :groupId and h.status = 'HELD'")
    int captureByGroup(@Param("groupId") Long groupId);

    @Modifying
    @Query("update WalletHoldEntity h set h.status = 'RELEASED' where h.groupId = :groupId and h.status = 'HELD'")
    int releaseByGroup(@Param("groupId") Long groupId);
}



