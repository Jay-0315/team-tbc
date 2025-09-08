package com.tbc.chat.domain.model;

import lombok.*;

import java.time.Instant;

@Getter @Setter
@AllArgsConstructor @NoArgsConstructor @Builder
public class ChatMessage {
    private Long roomId;
    private Long userId;
    private String content;
    private Instant sentAt;
}