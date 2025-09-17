package com.tbc.chat.adapterin.ws;

import com.tbc.chat.jwt.JwtVerifier;             // 패키지 prefix com.back → com.tbc 로 맞추기
import com.tbc.chat.domain.port.MembershipPort;      // 동일하게 com.tbc 로
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
        //  반드시 ServletServerHttpRequest 로 캐스팅해서 HttpServletRequest 꺼내야 함
        HttpServletRequest servletReq = ((ServletServerHttpRequest) request).getServletRequest();

        // 1) roomId 추출
        String uri = servletReq.getRequestURI(); // 예: /chat/1
        Matcher m = ROOM_PATTERN.matcher(uri);
        if (!m.find()) return false;
        Long roomId = Long.valueOf(m.group(1));
        attributes.put("roomId", roomId);

        // 2) token 추출 (Authorization 헤더 > ?token= 쿼리)
        String auth = servletReq.getHeader("Authorization");
        String token = null;
        if (auth != null && auth.startsWith("Bearer ")) token = auth.substring(7);
        if (token == null) token = servletReq.getParameter("token");

//        Long userId = jwtVerifier.verifyAndGetUserId(token);
//        if (userId == null) {
//            log.warn("JWT verify failed. uri={}, token={}", uri, token);
//            return false;
//        }

        Long userId = 77L; // 테스트 이후 원복 예정

        // 3) 멤버십 권한 체크 테스트 이후 원복 예정
//        if (!membershipPort.isMember(roomId, userId)) {
//            log.warn("Not a member: roomId={}, userId={}", roomId, userId);
//            return false;
//        }


        attributes.put("userId", userId);
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // 필요 시 로깅/후처리
    }
}
