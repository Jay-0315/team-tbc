package com.tbc.chat.adapterin.ws;

import com.tbc.chat.jwt.JwtVerifier;
import com.tbc.chat.domain.port.MembershipPort;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtRoomHandshakeInterceptor implements HandshakeInterceptor {

    private static final Pattern ROOM_PATTERN = Pattern.compile("/chat/(\\d+)");
    private final JwtVerifier jwtVerifier;
    private final MembershipPort membershipPort;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        HttpServletRequest servletReq = ((ServletServerHttpRequest) request).getServletRequest();
        String uri = servletReq.getRequestURI();

        // SockJS의 내부 요청들은 허용 (예: /ws/022/ti40becc/xhr_streaming)
        if (uri.startsWith("/ws/") && !uri.matches("/chat/\\d+")) {
            log.debug("Allowing SockJS internal request: {}", uri);
            return true;
        }

        // 채팅방 요청만 처리
        Matcher m = ROOM_PATTERN.matcher(uri);
        if (!m.find()) {
            log.warn("Invalid room URI pattern: {}", uri);
            return false;
        }

        Long roomId = Long.valueOf(m.group(1));
        attributes.put("roomId", roomId);

        // JWT 토큰 검증
        String auth = servletReq.getHeader("Authorization");
        String token = null;
        if (auth != null && auth.startsWith("Bearer ")) {
            token = auth.substring(7);
        }
        if (token == null) {
            token = servletReq.getParameter("token");
        }

        Long userId = jwtVerifier.verifyAndGetUserId(token);
        if (userId == null) {
            log.warn("JWT verify failed. uri={}, token={}", uri, token);
            response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
            return false;
        }

        // 멤버십 권한 체크
        if (!membershipPort.isMember(roomId, userId)) {
            log.warn("Not a member: roomId={}, userId={}", roomId, userId);
            response.setStatusCode(org.springframework.http.HttpStatus.FORBIDDEN);
            return false;
        }

        attributes.put("userId", userId);
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        if (exception != null) {
            log.error("WebSocket handshake failed", exception);
        }
    }
}
