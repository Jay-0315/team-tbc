package com.tbc.login.adapter.out.security;

import com.tbc.login.domain.User;
import com.tbc.login.domain.UserService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2LoginSuccessHandler.class);
    
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    public OAuth2LoginSuccessHandler(
            JwtTokenProvider jwtTokenProvider,
            @Lazy UserService userService) {
        log.info("=== OAuth2LoginSuccessHandler Constructor Called ===");
        this.jwtTokenProvider = jwtTokenProvider;
        this.userService = userService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        log.info("=== OAuth2 Login Success Handler Called ===");
        log.info("Request URL: {}", request.getRequestURL());
        log.info("Request URI: {}", request.getRequestURI());
        log.info("Session ID: {}", request.getSession().getId());
        log.info("Session isNew: {}", request.getSession().isNew());

        String email = null;
        String name = null;

        // OAuth2 정보 추출 - Spring Boot 3.x 방식
        log.info("=== OAuth2 Login Success Handler Debug ===");
        log.info("Authentication: {}", authentication);
        log.info("Authentication isAuthenticated: {}", authentication != null ? authentication.isAuthenticated() : "null");
        
        if (authentication != null && authentication.isAuthenticated()) {
            // OAuth2AuthenticationToken 사용
            if (authentication instanceof OAuth2AuthenticationToken oauth2Token) {
                OAuth2User oAuth2User = oauth2Token.getPrincipal();
                Map<String, Object> attrs = oAuth2User.getAttributes();
                
                log.info("OAuth2AuthenticationToken found");
                log.info("OAuth2User: {}", oAuth2User);
                log.info("OAuth2User attributes: {}", attrs);
                
                // 구글: "email", "name", "picture"
                email = (String) attrs.get("email");
                name = (String) attrs.get("name");
                
                log.info("Extracted email: {}", email);
                log.info("Extracted name: {}", name);
                
                if (email == null) {
                    // 필요시 provider 별 분기 추가
                    email = (String) attrs.get("login"); // 깃허브 id 등
                    log.info("Using login as email: {}", email);
                }
            } else {
                log.error("Authentication is not OAuth2AuthenticationToken: {}", authentication.getClass().getName());
                log.error("Authentication details: {}", authentication);
                
                // 대안: Principal이 OAuth2User인지 직접 확인
                Object principal = authentication.getPrincipal();
                if (principal instanceof OAuth2User oAuth2User) {
                    Map<String, Object> attrs = oAuth2User.getAttributes();
                    log.info("Found OAuth2User directly: {}", attrs);
                    
                    email = (String) attrs.get("email");
                    name = (String) attrs.get("name");
                    
                    log.info("Direct extraction - email: {}, name: {}", email, name);
                }
            }
        } else {
            log.error("Authentication is null or not authenticated!");
        }

        log.info("OAuth2 login success. email={}, name={}", email, name);

        if (email == null) {
            log.error("OAuth2 login failed: email is null");
            response.sendRedirect("http://localhost:5173?error=oauth2_email_not_found");
            return;
        }

        // Google OAuth에서 받은 고유 ID 추출
        String googleId = null;
        if (authentication instanceof OAuth2AuthenticationToken oauth2Token) {
            OAuth2User oAuth2User = oauth2Token.getPrincipal();
            Map<String, Object> attrs = oAuth2User.getAttributes();
            
            log.info("=== Google OAuth2 Attributes ===");
            log.info("All attributes: {}", attrs);
            log.info("Available keys: {}", attrs.keySet());
            
            // Google의 고유 ID는 'sub' 필드에 있음
            googleId = (String) attrs.get("sub");
            
            // 'sub'가 없으면 다른 필드 시도
            if (googleId == null) {
                googleId = (String) attrs.get("id");
                log.warn("'sub' not found, using 'id' instead: {}", googleId);
            }
            
            log.info("Extracted Google ID (sub): {}", googleId);
            log.info("Extracted email: {}", attrs.get("email"));
            log.info("Extracted name: {}", attrs.get("name"));
        }

        if (googleId == null) {
            log.error("OAuth2 login failed: Google ID is null after extraction attempts");
            response.sendRedirect("http://localhost:5173?error=oauth2_id_not_found");
            return;
        }

        final String finalEmail = email;
        final String finalGoogleId = googleId;

        // 1. Google ID로 먼저 조회 (이미 연동된 계정)
        Optional<User> userByGoogleId = userService.findByGoogleId(finalGoogleId);
        
        User user;
        boolean isNewLink = false; // 새로 연동되었는지 여부
        
        if (userByGoogleId.isPresent()) {
            // Google 계정이 이미 연동되어 있음
            user = userByGoogleId.get();
            log.info("Found user by Google ID: {}", user.getEmail());
        } else {
            // 2. 이메일로 조회 (기존 계정 존재 여부 확인)
            Optional<User> userByEmail = userService.findByEmailOptional(finalEmail);
            
            if (userByEmail.isPresent()) {
                // 기존 계정이 있음 → Google 계정 연동
                user = userByEmail.get();
                log.info("Found existing user by email: {}. Linking Google account...", user.getEmail());
                
                try {
                    userService.linkGoogleAccount(user.getId(), finalGoogleId);
                    isNewLink = true; // 새로 연동됨
                    log.info("Successfully linked Google account to user: {}", user.getEmail());
                } catch (Exception e) {
                    log.error("Failed to link Google account", e);
                    response.sendRedirect("http://localhost:5173?error=google_link_failed&message=" + 
                        java.net.URLEncoder.encode(e.getMessage(), java.nio.charset.StandardCharsets.UTF_8));
                    return;
                }
            } else {
                // 계정이 없음 → 회원가입 먼저 필요
                log.error("No existing account found for email: {}. Signup required.", finalEmail);
                response.sendRedirect("http://localhost:5173?error=signup_required&email=" + 
                    java.net.URLEncoder.encode(finalEmail, java.nio.charset.StandardCharsets.UTF_8));
                return;
            }
        }

        // JWT 토큰 발급 (일반 로그인과 동일한 방식)
        log.info("Generating JWT tokens for user: {}", user.getEmail());
        String accessToken = jwtTokenProvider.createAccessToken(user.getEmail());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getEmail());
        
        log.info("Access token generated, length: {}", accessToken.length());
        log.info("Refresh token generated, length: {}", refreshToken.length());

        // Refresh 토큰 DB에 저장
        Claims refreshClaims = jwtTokenProvider.parseClaims(refreshToken);
        String refreshJti = refreshClaims.getId();
        userService.persistRefreshToken(
                refreshJti, user.getId(), user.getEmail(), refreshClaims.getExpiration().toInstant()
        );

        log.info("OAuth2 login completed for user: {}", email);
        log.info("Refresh token saved to DB with JTI: {}", refreshJti);
        
        // 연동 성공/로그인 성공에 따라 다른 메시지 전달
        String successParam = isNewLink ? "google_linked=true" : "login=success";
        
        // 프론트엔드로 리다이렉트 (JWT 토큰 전달)
        String redirectHtml = String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <title>%s</title>
                <meta charset="UTF-8">
            </head>
            <body>
                <script>
                    try {
                        // localStorage에 토큰 저장
                        localStorage.setItem('accessToken', '%s');
                        console.log('OAuth2 token stored successfully');
                        
                        // 토큰 저장 완료 후 프론트엔드로 리다이렉트
                        setTimeout(function() {
                            window.location.href = 'http://localhost:5173?%s';
                        }, 100);
                    } catch (error) {
                        console.error('Failed to store OAuth2 token:', error);
                        window.location.href = 'http://localhost:5173?error=token_storage_failed';
                    }
                </script>
                <p>%s</p>
            </body>
            </html>
            """, 
            isNewLink ? "계정 연동 완료" : "로그인 완료",
            accessToken, 
            successParam,
            isNewLink ? "Google 계정 연동 중입니다..." : "로그인 중입니다...");
        
        response.setContentType("text/html; charset=UTF-8");
        response.getWriter().write(redirectHtml);
    }
}
