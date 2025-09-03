package com.tbc.tbc.payments.api.dto;

public record CreatePaymentRequest(
        Long userId,
        String orderId,
        Long amount,
        String orderName
) {}
