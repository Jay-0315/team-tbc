package com.tbc.chat.application.dto;

public record PresenceMessage(
    Long roomId,
    Long userId,
    String userNickname,
    String status  // "ONLINE", "AWAY", "OFFLINE"
) {}

