package com.tbc.tbc.payments.adapter.out.client.dto;

public record TossCancelReq(
        Long cancelAmount,
        String cancelReason
) {}
