package com.tbc.payments.adapter.out.client.dto;

public record TossPaymentRes(
        String paymentKey,
        String orderId,
        String status,
        Long totalAmount
) {}
