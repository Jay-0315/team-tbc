package com.tbc.payments.domain.model;

import java.time.Instant;

public record Wallet(
        Long id,
        Long userId,
        Long balance,
        Instant updatedAt
) {
    public static Wallet of(Long userId, long initialBalance) {
        return new Wallet(null, userId, initialBalance, null);
    }
}



