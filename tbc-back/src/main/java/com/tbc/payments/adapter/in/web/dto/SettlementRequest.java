package com.tbc.payments.adapter.in.web.dto;

public record SettlementRequest(
        Long hostId,       // 정산받을 호스트 ID
        Long meetingId,    // 모임 ID (정산할 모임 식별자)
        Long totalAmount   // 정산 금액 (참가자 합산)
) {}
