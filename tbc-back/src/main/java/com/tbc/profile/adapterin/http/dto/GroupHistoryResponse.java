package com.tbc.profile.adapterin.http.dto;

import java.time.LocalDateTime;

public record GroupHistoryResponse(
    Long id,
    String title,
    String category,
    String location,
    LocalDateTime startAt,
    Integer capacity,
    Integer joined,
    String status,
    String role,
    LocalDateTime joinedAt
) {}
