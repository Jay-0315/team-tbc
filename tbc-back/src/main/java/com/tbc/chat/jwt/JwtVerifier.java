package com.tbc.chat.jwt;

<<<<<<< HEAD
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
=======
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
>>>>>>> origin/dev
    }
}
