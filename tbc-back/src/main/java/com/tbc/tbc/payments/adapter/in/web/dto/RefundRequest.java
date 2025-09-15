package com.tbc.tbc.payments.adapter.in.web.dto;

public record RefundRequest (
    String orderId,
    Long refundAmount,
    String reason
) {}