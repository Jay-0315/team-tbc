package com.tbc.chat.adapterin.ws;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class StompWebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtRoomHandshakeInterceptor jwtRoomHandshakeInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // ✅ 구독 prefix: 프론트는 /topic/rooms/{roomId} 를 subscribe
        registry.enableSimpleBroker("/topic");

        // ✅ 발행 prefix: 프론트는 /app/rooms/{roomId}/send 로 publish
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // ✅ SockJS 엔드포인트 - 기본 연결용
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .addInterceptors(jwtRoomHandshakeInterceptor) // JWT 검증 인터셉터 추가
                .withSockJS();
                
        // ✅ 채팅방별 엔드포인트 - 채팅방 ID를 URL에 포함
        registry.addEndpoint("/chat/{roomId}")
                .setAllowedOriginPatterns("*")
                .addInterceptors(jwtRoomHandshakeInterceptor) // JWT 검증 인터셉터 추가
                .withSockJS();
    }
}
