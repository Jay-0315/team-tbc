package com.tbc.chat.jwt;

import com.tbc.login.adapter.out.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtVerifier {
    
    private final JwtTokenProvider jwtTokenProvider;

    public Long verifyAndGetUserId(String token) {
        if (token == null || token.isBlank()) {
            log.warn("JWT token is null or blank");
            return null;
        }
        
        try {
            // JWT 토큰 검증
            jwtTokenProvider.validateAccess(token);
            
            // Claims에서 사용자 정보 추출
            var claims = jwtTokenProvider.parseClaims(token);
            String email = claims.getSubject();
            
            if (email == null || email.isBlank()) {
                log.warn("JWT token subject (email) is null or blank");
                return null;
            }
            
            // TODO: email을 userId로 변환하는 로직이 필요합니다
            // 현재는 임시로 email의 해시값을 사용 (int를 Long으로 변환)
            return (long) Math.abs(email.hashCode());
            
        } catch (Exception e) {
            log.warn("JWT verification failed: {}", e.getMessage());
            return null;
        }
    }
}
