package com.tbc.tbc.payments.adapter.in.web.dto;

public record SettlementResponse(
        Long meetingId,
        Long hostId,
        Long amount,
        Long hostBalanceAfter,
        Long platformBalanceAfter
) {}
