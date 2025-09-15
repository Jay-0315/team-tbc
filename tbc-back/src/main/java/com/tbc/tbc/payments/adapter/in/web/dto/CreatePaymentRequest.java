package com.tbc.tbc.payments.adapter.in.web.dto;

public record CreatePaymentRequest(
        Long userId,
        String orderId,
        Long amount,
        String orderName
) {}
