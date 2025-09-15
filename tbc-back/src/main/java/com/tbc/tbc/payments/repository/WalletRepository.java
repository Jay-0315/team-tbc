package com.tbc.tbc.payments.repository;

import com.tbc.tbc.payments.domain.wallet.Wallet;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {

    Optional<Wallet> findByUserId(Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE) // 🔒 트랜잭션 동안 해당 row에 락을 걸어줌
    @Query("select w from Wallet w where w.userId = :userId")
    Optional<Wallet> findByUserIdForUpdate(Long userId);
}
