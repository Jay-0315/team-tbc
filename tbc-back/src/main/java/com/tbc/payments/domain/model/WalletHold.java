package com.tbc.payments.domain.model;

import java.time.Instant;

public record WalletHold(
        Long id,
        Long userId,
        Long groupId,
        Long amount,
        String status, // HELD, RELEASED, CAPTURED
        Instant createdAt,
        Instant updatedAt
) {}



