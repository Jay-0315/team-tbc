package com.tbc.tbc.payments.api.dto;

public record ConfirmResponse(
        String orderId,
        String state,
        Long creditedAmount,
        Long balanceAfter
) {}
