package com.tbc.chat.adapterin.ws;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final ChatHandler chatHandler;
    private final JwtRoomHandshakeInterceptor jwtRoomHandshakeInterceptor;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry
                .addHandler(chatHandler, "/chat/{roomId}")
                .addInterceptors(jwtRoomHandshakeInterceptor)
                .setAllowedOriginPatterns("*");
                //.setAllowedOriginPatterns("http://localhost", "http://localhost:5173");
        // .withSockJS(); // 필요시 사용
    }
}
