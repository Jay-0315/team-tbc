package com.tbc.common.util;

import com.tbc.login.adapter.out.security.JwtTokenProvider;
import com.tbc.login.domain.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtUtils {
    private static final Logger log = LoggerFactory.getLogger(JwtUtils.class);

    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

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
            try {
                return userService.findByEmailOptional(email)
                        .map(u -> u.getId())
                        .orElseGet(() -> {
                            Long fb = (long) Math.abs(email.hashCode());
                            log.debug("[JwtUtils] User not found by email, using fallback hash id for email={}", email);
                            return fb;
                        });
            } catch (Exception e) {
                Long fb = (long) Math.abs(email.hashCode());
                log.debug("[JwtUtils] User lookup failed, fallback hash id for email={}, err={}", email, e.getMessage());
                return fb;
            }
        } catch (Exception e) {
            log.debug("[JwtUtils] Token validation failed: {}", e.getMessage());
            return null;
        }
    }
}
