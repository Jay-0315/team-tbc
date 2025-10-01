package com.tbc.chat.application.dto;

public record TypingMessage(
    Long roomId,
    Long userId,
    String userNickname,
    Boolean isTyping
) {}

