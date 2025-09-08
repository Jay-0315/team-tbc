package com.tbc_back.tbc_back.adapters.out.persistence.jpa;

import com.tbc_back.tbc_back.adapters.out.persistence.entity.WalletEntity;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SpringDataWalletJpaRepository extends JpaRepository<WalletEntity, String> {

    Optional<WalletEntity> findByOwnerUserId(String ownerUserId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
           UPDATE WalletEntity w
              SET w.balancePoints = w.balancePoints - :amount
            WHERE w.id = :walletId
              AND w.balancePoints >= :amount
           """)
    int deductBalance(@Param("walletId") String walletId, @Param("amount") long amount);
}
