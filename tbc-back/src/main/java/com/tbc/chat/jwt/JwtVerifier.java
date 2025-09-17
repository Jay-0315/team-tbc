package com.tbc.chat.jwt;

import org.springframework.stereotype.Component;

@Component
public class JwtVerifier {
    // TODO: 실제 키/검증 로직으로 교체
    public Long verifyAndGetUserId(String token) {
        if (token == null || token.isBlank()) return null;
        // 데모: "uid:<숫자>"면 그 숫자를 userId로 사용
        if (token.startsWith("uid:")) {
            try { return Long.parseLong(token.substring(4)); } catch (Exception ignored) {}
        }
        // 데모 기본값 (인증 안 되면 null 반환해서 차단하고 싶으면 아래 주석을 해제)
        return 1L; // null 을 리턴하면 접속 거부
    }
}
