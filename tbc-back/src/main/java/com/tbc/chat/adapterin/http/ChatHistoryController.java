package com.tbc.chat.adapterin.http;

import com.tbc.chat.application.dto.ChatMessageDto;
import com.tbc.chat.application.dto.ParticipantInfo;
import com.tbc.chat.application.facade.ChatFacade;
import com.tbc.common.util.JwtUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Chat")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatHistoryController {

    private final ChatFacade chat;
    private final JwtUtils jwtUtils;

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

    @Operation(summary = "채팅방 참여자 목록 조회 (프로필 + 온라인 상태)")
    @GetMapping("/rooms/{roomId}/participants")
    public ParticipantsResponse getParticipants(@PathVariable Long roomId) {
        List<ParticipantInfo> participants = chat.getParticipants(roomId);
        int onlineCount = chat.getOnlineCount(roomId);
        return new ParticipantsResponse(participants, onlineCount);
    }

    @Operation(summary = "안읽은 메시지 수 조회")
    @GetMapping("/rooms/{roomId}/unread-count")
    public UnreadCountResponse getUnreadCount(
            @PathVariable Long roomId,
            HttpServletRequest request
    ) {
        Long userId = jwtUtils.getUserIdFromRequest(request);
        if (userId == null) {
            return new UnreadCountResponse(0);
        }
        int unreadCount = chat.getUnreadCount(roomId, userId);
        return new UnreadCountResponse(unreadCount);
    }

    @Operation(summary = "채팅방 전체 메시지 읽음 처리")
    @PostMapping("/rooms/{roomId}/mark-all-read")
    public MarkAllReadResponse markAllAsRead(
            @PathVariable Long roomId,
            HttpServletRequest request
    ) {
        Long userId = jwtUtils.getUserIdFromRequest(request);
        if (userId == null) {
            return new MarkAllReadResponse(0, "Unauthorized");
        }
        int markedCount = chat.markAllAsRead(roomId, userId);
        return new MarkAllReadResponse(markedCount, "OK");
    }

    @Operation(summary = "채팅방의 가장 최신 메시지 조회")
    @GetMapping("/rooms/{roomId}/latest-message")
    public ChatMessageDto getLatestMessage(@PathVariable Long roomId) {
        return chat.getLatestMessage(roomId);
    }

    @Operation(summary = "사용자 온라인 상태 조회")
    @GetMapping("/users/{userId}/online-status")
    public OnlineStatusResponse getUserOnlineStatus(@PathVariable Long userId) {
        boolean isOnline = chat.isUserOnline(userId);
        return new OnlineStatusResponse(userId, isOnline);
    }

    public record HistoryResponse(List<ChatMessageDto> items, Long nextCursor) {}
    public record ParticipantsResponse(List<ParticipantInfo> participants, int onlineCount) {}
    public record UnreadCountResponse(int unreadCount) {}
    public record MarkAllReadResponse(int markedCount, String status) {}
    public record OnlineStatusResponse(Long userId, boolean isOnline) {}
}
