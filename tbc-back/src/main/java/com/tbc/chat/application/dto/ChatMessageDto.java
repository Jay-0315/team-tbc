package com.tbc.chat.application.dto;

import com.tbc.chat.domain.model.ChatMessageType;
import java.time.Instant;
import java.util.List;

public record ChatMessageDto(
    Long id,
    Long roomId,
    Long userId,
    String userNickname,           // ✅ 추가
    String userProfileImage,       // ✅ 추가
    ChatMessageType type,
    String content,
    Instant createdAt,             // sentAt → createdAt 변경
    List<Long> readBy              // ✅ 추가
) {
    // 기본값을 가진 생성자 (readBy 없이)
    public ChatMessageDto(Long id, Long roomId, Long userId, String userNickname,
                          String userProfileImage, ChatMessageType type,
                          String content, Instant createdAt) {
        this(id, roomId, userId, userNickname, userProfileImage, type, content, createdAt, List.of());
    }
}
