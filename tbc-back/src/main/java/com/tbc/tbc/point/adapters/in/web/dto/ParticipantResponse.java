package com.tbc.tbc.point.adapters.in.web.dto;

import java.time.Instant;

public record ParticipantResponse(
        String userId,
        String role,
        String status,
        Instant joinedAt
) {}
