package com.tbc.tbc.payments.api.dto;

public record ConfirmRequest(
        String paymentKey,
        String orderId,
        Long amount
) {}
