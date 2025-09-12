package com.tbc_back.tbc_back.domain.repository;

import com.tbc_back.tbc_back.domain.model.Wallet;

import java.util.Optional;

public interface WalletRepository {
    Optional<Wallet> findByOwnerUserId(String userId);

    /**
     * 동시성 안전: 잔액이 충분할 때만 차감 (1 row 갱신 시 true)
     */
    boolean atomicDeduct(String walletId, long amount);
}
