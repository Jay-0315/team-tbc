package com.tbc.payments.adapter.in.web.dto;

public record CreatePaymentRequest(
        Long userId,
        String orderId,
        Long amount,
        String orderName
) {}
