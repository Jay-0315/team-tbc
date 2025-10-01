package com.tbc.chat.application.dto;

import java.time.Instant;
import java.time.LocalDateTime;

/**
 * 채팅방 참여자 정보 (프로필 + 온라인 상태)
 */
public record ParticipantInfo(
    Long userId,
    String displayName,
    String profileImageUrl,
    String role,              // "HOST" / "MEMBER"
    String presenceStatus,    // "ONLINE" / "AWAY" / "OFFLINE"
    Instant lastSeenAt,
    LocalDateTime joinedAt
) {}

