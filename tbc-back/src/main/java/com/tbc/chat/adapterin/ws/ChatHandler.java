package com.tbc.chat.adapterin.ws;

import com.tbc.chat.application.dto.ChatMessageDto;
import com.tbc.chat.application.facade.ChatFacade;
import com.tbc.chat.application.service.PresenceService;
import com.tbc.chat.config.ChatProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatHandler extends TextWebSocketHandler {

    private final ChatFacade chat;
    private final ObjectMapper om;
    private final PresenceService presence;   // 접속 인원 관리
    private final ChatProperties props;       // yml 바인딩 (max-content-length, max-qps-per-session)

    // roomId -> sessions
    private final Map<Long, Set<WebSocketSession>> rooms = new ConcurrentHashMap<>();
    // sessionId -> [secEpoch, count] (초당 메시지 횟수)
    private final Map<String, int[]> counters = new ConcurrentHashMap<>();

    // 클라이언트 입력 포맷
    record InboundPayload(String type, String content) {}

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        Long roomId = longAttr(session, "roomId", null);
        Long userId = longAttr(session, "userId", 0L);
        if (roomId == null) { closeQuietly(session, CloseStatus.BAD_DATA); return; }

        rooms.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(session);
        int online = presence.join(roomId, userId);

        log.info("WS connected: room={}, user={}, session={}", roomId, userId, session.getId());

        // 시스템 JOIN 알림 (비영속)
        var sys = Map.of("type","SYSTEM","subType","JOIN",
                "roomId", roomId, "userId", userId, "online", online);
        broadcastJson(roomId, sys);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        Long roomId = longAttr(session, "roomId", null);
        Long userId = longAttr(session, "userId", 1L);
        if (roomId == null) return;

        String payload = message.getPayload();

        // 1) 길이 제한
        if (payload.length() > props.getMaxContentLength()) {
            closeQuietly(session, CloseStatus.TOO_BIG_TO_PROCESS);
            return;
        }

        // 2) 레이트리밋(초당)
        if (isOverLimit(session.getId(), props.getMaxQpsPerSession())) {
            closeQuietly(session, CloseStatus.POLICY_VIOLATION);
            return;
        }

        try {
            var in = om.readValue(payload, InboundPayload.class);
            String type = in.type() == null ? "" : in.type().toLowerCase();

            // ping 하트비트 무시
            if ("ping".equals(type)) return;

            if ("chat".equals(type)) {
                ChatMessageDto saved = chat.sendAndPersist(roomId, userId, in.content());
                broadcastJson(roomId, saved); // 저장된 DTO를 브로드캐스트
            }
            // 필요 시 "typing", "system" 등 확장

        } catch (Exception e) {
            log.warn("handleTextMessage error", e);
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable ex) {
        log.warn("WS transport error: session={}", session != null ? session.getId() : "null", ex);
        if (session != null) {
            try { session.close(CloseStatus.SERVER_ERROR); } catch (Exception ignore) {}
            afterConnectionClosed(session, CloseStatus.SERVER_ERROR);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Long roomId = longAttr(session, "roomId", null);
        Long userId = longAttr(session, "userId", 0L);

        if (roomId != null) {
            var set = rooms.get(roomId);
            if (set != null) {
                set.remove(session);
                if (set.isEmpty()) rooms.remove(roomId);
            }
        }
        counters.remove(session.getId());

        int online = presence.leave(roomId, userId);
        log.info("WS closed: room={}, user={}, session={}, status={}", roomId, userId, session.getId(), status);

        // 시스템 LEAVE 알림 (비영속)
        var sys = Map.of("type","SYSTEM","subType","LEAVE",
                "roomId", roomId, "userId", userId, "online", online);
        broadcastJson(roomId, sys);
    }

    /* -------------------- helpers -------------------- */

    private void broadcastJson(Long roomId, Object obj) {
        try {
            String json = (obj instanceof String s) ? s : om.writeValueAsString(obj);
            for (WebSocketSession s : rooms.getOrDefault(roomId, Set.of())) {
                if (s.isOpen()) s.sendMessage(new TextMessage(json));
            }
        } catch (IOException e) {
            log.warn("broadcast error", e);
        } catch (Exception e) {
            log.warn("broadcast serialization error", e);
        }
    }

    private Long longAttr(WebSocketSession session, String key, Long def) {
        Object v = session.getAttributes().get(key);
        if (v == null) return def;
        if (v instanceof Long l) return l;
        if (v instanceof Integer i) return i.longValue();
        if (v instanceof String s) try { return Long.parseLong(s); } catch (Exception ignore) {}
        return def;
    }

    private boolean isOverLimit(String sessionId, int maxQps) {
        long nowSec = System.currentTimeMillis() / 1000;
        int[] c = counters.computeIfAbsent(sessionId, k -> new int[]{(int) nowSec, 0});
        if (c[0] != nowSec) { c[0] = (int) nowSec; c[1] = 0; }
        return ++c[1] > maxQps;
    }

    private void closeQuietly(WebSocketSession session, CloseStatus status) {
        try { session.close(status); } catch (Exception ignore) {}
    }
}
