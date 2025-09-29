package com.tbc.common.util;

import com.tbc.login.adapter.out.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtUtils {
    
    private final JwtTokenProvider jwtTokenProvider;
    
    public Long getUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        
        String token = authHeader.substring(7);
        try {
            jwtTokenProvider.validateAccess(token);
            var claims = jwtTokenProvider.parseClaims(token);
            String email = claims.getSubject();
            
            if (email == null || email.isBlank()) {
                return null;
            }
            
            // email의 해시값을 사용자 ID로 사용 (JwtVerifier와 동일한 로직)
            return (long) Math.abs(email.hashCode());
        } catch (Exception e) {
            return null;
        }
    }
}
