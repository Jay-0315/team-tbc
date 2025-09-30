package com.tbc.payments.adapter.out.client.dto;

public record TossCancelReq(
        Long cancelAmount,
        String cancelReason
) {}
