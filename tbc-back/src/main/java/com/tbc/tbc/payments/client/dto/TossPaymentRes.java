package com.tbc.tbc.payments.client.dto;

public record TossPaymentRes(
        String paymentKey,
        String orderId,
        String status,
        Long totalAmount
) {}
