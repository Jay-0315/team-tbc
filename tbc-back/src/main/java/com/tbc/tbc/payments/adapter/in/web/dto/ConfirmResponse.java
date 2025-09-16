package com.tbc.tbc.payments.adapter.in.web.dto;

public record ConfirmResponse(
        String orderId,
        String state,
        Long creditedAmount,
        Long balanceAfter
) {}
