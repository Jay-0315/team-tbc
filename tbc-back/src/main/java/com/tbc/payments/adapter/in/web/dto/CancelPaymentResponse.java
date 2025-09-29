package com.tbc.payments.adapter.in.web.dto;

public record CancelPaymentResponse(
        String orderId,
        String state
) {}