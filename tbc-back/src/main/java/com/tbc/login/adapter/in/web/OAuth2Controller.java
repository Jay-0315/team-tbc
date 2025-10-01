package com.tbc.login.adapter.in.web;

import com.tbc.login.adapter.out.security.JwtTokenProvider;
import com.tbc.login.domain.User;
import com.tbc.login.domain.UserService;
import com.tbc.login.dto.SignupRequest;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/oauth2")
public class OAuth2Controller {

    private static final Logger log = LoggerFactory.getLogger(OAuth2Controller.class);
    
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;
    private final RestTemplate restTemplate;
    
    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;
    
    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;
    
    @Value("${app.oauth2.google.redirect-uri:http://localhost:8080/api/oauth2/google/callback}")
    private String googleRedirectUri;

    public OAuth2Controller(JwtTokenProvider jwtTokenProvider, UserService userService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userService = userService;
        this.restTemplate = new RestTemplate();
    }

    @GetMapping("/google/login")
    public void googleLogin(HttpServletResponse response) throws IOException {
        String googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth?" +
                "client_id=" + googleClientId +
                "&redirect_uri=" + googleRedirectUri +
                "&scope=email profile" +
                "&response_type=code" +
                "&access_type=offline" +
                "&prompt=consent";
        
        log.info("Redirecting to Google auth URL");
        response.sendRedirect(googleAuthUrl);
    }

    @GetMapping("/google/callback")
    public void googleCallback(@RequestParam String code, HttpServletResponse response) throws IOException {
        try {
            // 1. Authorization Code를 Access Token으로 교환
            String tokenUrl = "https://www.googleapis.com/oauth2/v4/token";
            String tokenRequestBody = "client_id=" + googleClientId +
                    "&client_secret=" + googleClientSecret +
                    "&code=" + code +
                    "&grant_type=authorization_code" +
                    "&redirect_uri=" + googleRedirectUri;

            @SuppressWarnings("unchecked")
            Map<String, Object> tokenResponse = restTemplate.postForObject(
                    tokenUrl, 
                    tokenRequestBody, 
                    Map.class
            );

            if (tokenResponse == null) {
                log.error("Failed to get token from Google");
                response.sendRedirect("http://localhost:5173?error=token_failed");
                return;
            }

            String accessToken = (String) tokenResponse.get("access_token");
            log.info("Google access token received");

            // 2. Access Token으로 사용자 정보 조회
            String userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + accessToken;
            @SuppressWarnings("unchecked")
            Map<String, Object> userInfo = restTemplate.getForObject(userInfoUrl, Map.class);

            if (userInfo == null) {
                log.error("Failed to get user info from Google");
                response.sendRedirect("http://localhost:5173?error=userinfo_failed");
                return;
            }

            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            String picture = (String) userInfo.get("picture");

            log.info("Google user info: email={}, name={}, picture={}", email, name, picture);

            if (email == null) {
                log.error("Google login failed: email is null");
                response.sendRedirect("http://localhost:5173?error=no_email");
                return;
            }

            String googleUserId = (String) userInfo.get("sub");  // 구글 고유 ID
            log.info("Google user ID: {}", googleUserId);

            // 3. 구글 ID로 이미 연동된 계정이 있는지 확인
            Optional<User> linkedUser = userService.findByGoogleId(googleUserId);
            
            User user;
            if (linkedUser.isPresent()) {
                // 이미 연동된 계정으로 로그인
                user = linkedUser.get();
                log.info("Found existing linked Google account for user: {}", user.getEmail());
            } else {
                // 구글 ID로 연동된 계정이 없음 - 이메일로 기존 계정 확인
                Optional<User> existingUser = userService.findByEmailOptional(email);
                
                if (existingUser.isPresent()) {
                    // 기존 계정이 있으면 자동으로 구글 ID 연동
                    user = existingUser.get();
                    log.info("Found existing account with email: {}. Linking Google account.", email);
                    userService.linkGoogleAccount(user.getId(), googleUserId);
                    log.info("Google account linked successfully for user: {}", email);
                } else {
                    // 신규 사용자 - 구글 계정으로 자동 회원가입
                    log.info("Creating new user with Google account: {}", email);
                    user = createNewGoogleUser(email, name, picture);
                    if (user == null) {
                        log.error("Failed to create new Google user");
                        response.sendRedirect("http://localhost:5173?error=signup_failed");
                        return;
                    }
                    // 생성된 계정에 구글 ID 연동
                    userService.linkGoogleAccount(user.getId(), googleUserId);
                    log.info("New Google user created and linked: {}", email);
                }
            }

            // JWT 토큰 발급
            String jwtAccessToken = jwtTokenProvider.createAccessToken(user.getEmail());
            String jwtRefreshToken = jwtTokenProvider.createRefreshToken(user.getEmail());

            // Refresh 토큰 DB에 저장
            Claims refreshClaims = jwtTokenProvider.parseClaims(jwtRefreshToken);
            String refreshJti = refreshClaims.getId();
            userService.persistRefreshToken(
                    refreshJti, user.getId(), user.getEmail(), refreshClaims.getExpiration().toInstant()
            );

            log.info("Google OAuth2 login completed for user: {}", user.getEmail());

            // localStorage에 토큰 저장하는 HTML 반환
            String redirectHtml = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <title>로그인 완료</title>
                    <meta charset="UTF-8">
                </head>
                <body>
                    <script>
                        try {
                            localStorage.setItem('accessToken', '%s');
                            console.log('Google login token stored successfully');
                            setTimeout(function() {
                                window.location.href = 'http://localhost:5173?login=success';
                            }, 100);
                        } catch (error) {
                            console.error('Failed to store token:', error);
                            window.location.href = 'http://localhost:5173?error=token_storage_failed';
                        }
                    </script>
                    <p>로그인 중입니다...</p>
                </body>
                </html>
                """, jwtAccessToken);

            response.setContentType("text/html; charset=UTF-8");
            response.getWriter().write(redirectHtml);

        } catch (Exception e) {
            log.error("Google OAuth2 login failed", e);
            response.sendRedirect("http://localhost:5173?error=oauth2_failed");
        }
    }

    private User createNewGoogleUser(String email, String name, String picture) {
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
            signupRequest.setPassword("GOOGLE_OAUTH2_NOT_USED"); // Google OAuth2 사용자는 비밀번호 불필요
            signupRequest.setRealName(name != null ? name : finalNickname);
            signupRequest.setNickname(finalNickname);
            
            return userService.signup(signupRequest);
        } catch (Exception e) {
            log.error("Failed to create Google OAuth2 user", e);
            return null;
        }
    }

    /**
     * 기존 계정에 구글 계정 연동
     * 로그인된 사용자만 접근 가능 (JWT 토큰 필요)
     */
    @PostMapping("/link-google")
    public ResponseEntity<Map<String, Object>> linkGoogleAccount(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> request) {
        try {
            // JWT 토큰에서 사용자 이메일 추출
            String token = authHeader.replace("Bearer ", "");
            Claims claims = jwtTokenProvider.parseClaims(token);
            String userEmail = claims.getSubject();

            // 현재 로그인된 사용자 조회
            User user = userService.findByEmailOptional(userEmail)
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

            // 구글에서 받은 정보
            String googleUserId = request.get("googleId");
            
            if (googleUserId == null || googleUserId.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "구글 ID가 제공되지 않았습니다."));
            }

            // 구글 계정 연동
            userService.linkGoogleAccount(user.getId(), googleUserId);
            
            log.info("Google account linked successfully for user: {}", user.getEmail());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "구글 계정이 성공적으로 연동되었습니다.",
                    "googleLinked", true
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to link Google account", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "구글 계정 연동에 실패했습니다."));
        }
    }

    private void addCookie(HttpServletResponse response, String name, String value, Duration maxAge) {
        response.addHeader("Set-Cookie", 
                name + "=" + value + 
                "; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=" + maxAge.getSeconds());
    }
}
