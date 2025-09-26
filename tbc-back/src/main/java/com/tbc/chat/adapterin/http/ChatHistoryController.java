package com.tbc.chat.adapterin.http;

import com.tbc.chat.application.dto.ChatMessageDto;
import com.tbc.chat.application.facade.ChatFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Chat")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatHistoryController {

    private final ChatFacade chat;

    @Operation(summary = "메시지 히스토리 조회 (cursor<id)")
    @GetMapping("/rooms/{roomId}/messages")
    public HistoryResponse getHistory(
            @PathVariable Long roomId,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "50") int limit
    ) {
        List<ChatMessageDto> items = chat.history(roomId, cursor, limit);
        Long nextCursor = items.isEmpty() ? null : items.get(0).id(); // 더 이전 페이지용 커서
        return new HistoryResponse(items, nextCursor);
    }

    public record HistoryResponse(List<ChatMessageDto> items, Long nextCursor) {}
}
