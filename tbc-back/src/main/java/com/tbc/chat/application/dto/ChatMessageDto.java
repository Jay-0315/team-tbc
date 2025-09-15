package com.tbc.chat.application.dto;

import com.tbc.chat.domain.model.ChatMessageType;
import java.time.Instant;

public record ChatMessageDto(
        Long id, Long roomId, Long userId,
        ChatMessageType type, String content, Instant sentAt
) {}
