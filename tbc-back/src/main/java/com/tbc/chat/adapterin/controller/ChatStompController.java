package com.tbc.chat.adapterin.controller;

import com.tbc.chat.application.dto.ChatMessageDto;
import com.tbc.chat.application.facade.ChatFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.Instant;

@Controller
@RequiredArgsConstructor
public class ChatStompController {

    private final ChatFacade chat;

    // 프론트 publish: /app/rooms/{roomId}/send
    // 프론트 subscribe: /topic/rooms/{roomId}
    @MessageMapping("/rooms/{roomId}/send")
    @SendTo("/topic/rooms/{roomId}")
    public ChatMessageDto send(@DestinationVariable Long roomId, ChatMessageDto msg) {
        // DB 저장 + 브로드캐스트
        return chat.sendAndPersist(roomId, msg.userId(), msg.content());
    }
}
