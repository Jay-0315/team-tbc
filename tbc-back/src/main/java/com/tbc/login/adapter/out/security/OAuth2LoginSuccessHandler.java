<<<<<<< HEAD
//package com.tbc.login.adapter.out.security;
//
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
//import org.springframework.security.oauth2.core.user.OAuth2User;
//import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
//import org.springframework.stereotype.Component;
//
//import java.io.IOException;
//import java.util.Map;
//
//@Component
//public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {
//
//    private static final Logger log = LoggerFactory.getLogger(OAuth2LoginSuccessHandler.class);
//
//    @Override
//    public void onAuthenticationSuccess(HttpServletRequest request,
//                                        HttpServletResponse response,
//                                        Authentication authentication) throws IOException, ServletException {
//
//        String email = null;
//
//        if (authentication instanceof OAuth2AuthenticationToken oauth) {
//            Object principal = oauth.getPrincipal();
//            if (principal instanceof OAuth2User oAuth2User) {
//                Map<String, Object> attrs = oAuth2User.getAttributes();
//                // 공급자 별 속성에서 이메일 추출 시도
//                // 구글: "email", 깃허브(기본은 email null일 수 있음): "email"
//                email = (String) attrs.get("email");
//                if (email == null) {
//                    // 필요시 provider 별 분기 추가
//                    email = (String) attrs.get("login"); // 깃허브 id 등
//                }
//            }
//        }
//
//        log.info("OAuth2 login success. email={}", email);
//
//        // TODO: 필요하다면 여기서 JWT 발급/쿠키 설정 로직 추가
//        response.sendRedirect("/");
//    }
//}
=======
package com.tbc.login.adapter.out.security;

import com.tbc.login.adapter.out.persistence.UserRepository;
import com.tbc.login.domain.User;
import com.tbc.login.domain.UserService;
import com.tbc.login.dto.SignupRequest;
import io.jsonwebtoken.Claims;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2LoginSuccessHandler.class);
    
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;
    private final UserRepository userRepository;

    public OAuth2LoginSuccessHandler(
            JwtTokenProvider jwtTokenProvider,
            @Lazy UserService userService,
            UserRepository userRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        String email = null;
        String name = null;

        if (authentication instanceof OAuth2AuthenticationToken oauth) {
            Object principal = oauth.getPrincipal();
            if (principal instanceof OAuth2User oAuth2User) {
                Map<String, Object> attrs = oAuth2User.getAttributes();
                // 구글: "email", "name"
                email = (String) attrs.get("email");
                name = (String) attrs.get("name");
                
                if (email == null) {
                    // 필요시 provider 별 분기 추가
                    email = (String) attrs.get("login"); // 깃허브 id 등
                }
            }
        }

        log.info("OAuth2 login success. email={}, name={}", email, name);

        if (email == null) {
            log.error("OAuth2 login failed: email is null");
            response.sendRedirect("http://localhost:5173?error=no_email");
            return;
        }

        // final로 선언하여 람다에서 사용 가능하도록
        final String finalEmail = email;
        final String finalName = name;

        // 사용자 조회 또는 생성
        User user = userService.findByEmailOptional(finalEmail)
                .orElseGet(() -> createNewOAuth2User(finalEmail, finalName));

        if (user == null) {
            log.error("Failed to create or find user for email: {}", email);
            response.sendRedirect("http://localhost:5173?error=user_creation_failed");
            return;
        }

        // JWT 토큰 발급 (AuthController와 동일한 방식)
        String accessToken = jwtTokenProvider.createAccessToken(user.getEmail());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getEmail());

        // Refresh 토큰 DB에 저장
        Claims refreshClaims = jwtTokenProvider.parseClaims(refreshToken);
        String refreshJti = refreshClaims.getId();
        userService.persistRefreshToken(
                refreshJti, user.getId(), user.getEmail(), refreshClaims.getExpiration().toInstant()
        );

        // 쿠키에 토큰 설정 (AuthController와 동일한 방식)
        addCookie(response, "access", accessToken, Duration.ofMinutes(15));
        addCookie(response, "refresh", refreshToken, Duration.ofDays(14));
        response.setHeader("Authorization", "Bearer " + accessToken);

        log.info("OAuth2 login completed for user: {}", email);
        
        // 프론트엔드로 리다이렉트
        response.sendRedirect("http://localhost:5173");
    }

    private User createNewOAuth2User(String email, String name) {
        try {
            String nickname = email.split("@")[0];
            // 닉네임 중복 체크 및 처리
            String finalNickname = nickname;
            int count = 1;
            while (!userService.isNicknameAvailable(finalNickname)) {
                finalNickname = nickname + count++;
            }
            
            SignupRequest signupRequest = new SignupRequest();
            signupRequest.setEmail(email);
            signupRequest.setPassword("OAUTH2_NOT_USED"); // OAuth2 사용자는 비밀번호 불필요
            signupRequest.setRealName(name != null ? name : finalNickname);
            signupRequest.setNickname(finalNickname);
            
            return userService.signup(signupRequest);
        } catch (Exception e) {
            log.error("Failed to create OAuth2 user", e);
            return null;
        }
    }

    private void addCookie(HttpServletResponse response, String name, String value, Duration maxAge) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(maxAge)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }
}
>>>>>>> origin/dev
