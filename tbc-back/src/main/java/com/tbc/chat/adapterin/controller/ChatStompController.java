package com.tbc.chat.adapterin.controller;

import com.tbc.chat.application.dto.ChatMessageDto;
import com.tbc.chat.application.dto.TypingMessage;
import com.tbc.chat.application.dto.ReadReceiptMessage;
import com.tbc.chat.application.dto.PresenceMessage;
import com.tbc.chat.application.facade.ChatFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatStompController {

    private final ChatFacade chat;

    // ✅ 메시지 전송
    // 프론트 publish: /app/rooms/{roomId}/send
    // 프론트 subscribe: /topic/rooms/{roomId}
    @MessageMapping("/rooms/{roomId}/send")
    @SendTo("/topic/rooms/{roomId}")
    public ChatMessageDto send(@DestinationVariable Long roomId, ChatMessageDto msg) {
        // DB 저장 + 브로드캐스트
        return chat.sendAndPersist(roomId, msg.userId(), msg.content());
    }

    // ✅ 타이핑 알림 (DB 저장 없이 브로드캐스트만)
    // 프론트 publish: /app/rooms/{roomId}/typing
    // 프론트 subscribe: /topic/rooms/{roomId}/typing
    @MessageMapping("/rooms/{roomId}/typing")
    @SendTo("/topic/rooms/{roomId}/typing")
    public TypingMessage handleTyping(
        @DestinationVariable Long roomId,
        TypingMessage message
    ) {
        return message;  // 그대로 브로드캐스트
    }

    // ✅ 읽음 상태 처리
    // 프론트 publish: /app/rooms/{roomId}/read
    // 프론트 subscribe: /topic/rooms/{roomId}/read
    @MessageMapping("/rooms/{roomId}/read")
    @SendTo("/topic/rooms/{roomId}/read")
    public ReadReceiptMessage handleReadReceipt(
        @DestinationVariable Long roomId,
        ReadReceiptMessage message
    ) {
        // DB에 읽음 상태 저장
        chat.markAsRead(roomId, message.userId(), message.messageId());
        return message;  // 브로드캐스트
    }

    // ✅ 온라인 상태 처리
    // 프론트 publish: /app/rooms/{roomId}/presence
    // 프론트 subscribe: /topic/rooms/{roomId}/presence
    @MessageMapping("/rooms/{roomId}/presence")
    @SendTo("/topic/rooms/{roomId}/presence")
    public PresenceMessage handlePresence(
        @DestinationVariable Long roomId,
        PresenceMessage message
    ) {
        // DB에 presence 저장
        chat.updatePresence(roomId, message.userId(), message.status());
        return message;  // 브로드캐스트
    }
}
