package com.tbc.tbc.payments.api.dto;

public record SettlementResponse(
        Long meetingId,
        Long hostId,
        Long amount,
        Long hostBalanceAfter,
        Long platformBalanceAfter
) {}
