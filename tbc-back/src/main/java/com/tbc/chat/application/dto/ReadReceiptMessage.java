package com.tbc.chat.application.dto;

public record ReadReceiptMessage(
    Long roomId,
    Long userId,
    String messageId  // String 타입 (프론트에서 temp-{timestamp} 형태 가능)
) {}

