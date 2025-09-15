package com.tbc.tbc.payments.client.dto;

public record TossCancelReq(
        Long cancelAmount,
        String cancelReason
) {}
