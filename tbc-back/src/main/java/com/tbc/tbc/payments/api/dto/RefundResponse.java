package com.tbc.tbc.payments.api.dto;

public record RefundResponse (
        String orderId,
        String state,
        Long refundedAmount,
        Long balanceAfter
) {}
