package com.tbc.common.util;

import com.tbc.login.adapter.out.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserUtils {
    
    private final JwtTokenProvider jwtTokenProvider;
    
    public String getEmailFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        
        String token = authHeader.substring(7);
        try {
            jwtTokenProvider.validateAccess(token);
            var claims = jwtTokenProvider.parseClaims(token);
            return claims.getSubject();
        } catch (Exception e) {
            return null;
        }
    }
}
