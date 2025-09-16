package com.tbc.tbc.payments.adapter.in.web.dto;

public record RefundResponse (
        String orderId,
        String state,
        Long refundedAmount,
        Long balanceAfter
) {}
