package com.tbc.point.adapters.in.web.dto;

import java.time.LocalDateTime;

public record ParticipantResponse(
        Long userId,
        String role,
        String status,
        LocalDateTime joinedAt
) {}
