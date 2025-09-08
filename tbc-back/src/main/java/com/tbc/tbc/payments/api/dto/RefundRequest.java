package com.tbc.tbc.payments.api.dto;

public record RefundRequest (
    String orderId,
    Long refundAmount,
    String reason
) {}