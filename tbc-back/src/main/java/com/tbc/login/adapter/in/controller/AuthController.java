package com.tbc.login.adapter.in.controller;

import com.tbc.common.ApiResponse; // ✅ 우리의 ApiResponse 임포트
import com.tbc.login.adapter.out.security.JwtTokenProvider;
import com.tbc.login.dto.*;
import com.tbc.login.domain.User;
import com.tbc.login.domain.UserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(UserService userService, JwtTokenProvider jwtTokenProvider) {
        this.userService = userService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Value("${app.cookie.secure:false}") private boolean cookieSecure;
    @Value("${app.cookie.same-site:None}") private String cookieSameSite;
    @Value("${app.cookie.access-name:access}") private String accessCookieName;
    @Value("${app.cookie.refresh-name:refresh}") private String refreshCookieName;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<SignupResponse>> signup(@Valid @RequestBody SignupRequest request) {
        User user = userService.signup(request);
        SignupResponse body = new SignupResponse(
                user.getId(), user.getEmail(), user.getRealName(), user.getNickname()
        );
        return ResponseEntity
                .created(URI.create("/api/users/" + user.getId()))
                .body(ApiResponse.ok(body));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenPair>> login(@Valid @RequestBody LoginRequest request,
                                                        HttpServletResponse response) {
        try {
            User user = userService.loadAndVerifyCredentials(request.getEmail(), request.getPassword());

            String accessToken = jwtTokenProvider.createAccessToken(user.getEmail());
            String refreshToken = jwtTokenProvider.createRefreshToken(user.getEmail());

            Claims refreshClaims = jwtTokenProvider.parseClaims(refreshToken);
            String refreshJti = refreshClaims.getId();
            userService.persistRefreshToken(
                    refreshJti, user.getId(), user.getEmail(), refreshClaims.getExpiration().toInstant()
            );

            addCookie(response, accessCookieName, accessToken, Duration.ofMinutes(15));
            addCookie(response, refreshCookieName, refreshToken, Duration.ofDays(14));
            response.setHeader("Authorization", "Bearer " + accessToken);

            return ResponseEntity.ok(ApiResponse.ok(new TokenPair(accessToken, refreshToken)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Void>> refresh(
            @CookieValue(name = "refresh", required = false) String refreshToken,
            HttpServletResponse response
    ) {
        if (refreshToken == null) return ResponseEntity.status(401).body(ApiResponse.error("Refresh token 없음"));
        try {
            jwtTokenProvider.validateRefresh(refreshToken);
            Claims oldClaims = jwtTokenProvider.parseClaims(refreshToken);
            String subject = oldClaims.getSubject();
            String oldJti = oldClaims.getId();

            userService.assertRefreshTokenUsable(oldJti);

            String newAccessToken = jwtTokenProvider.createAccessToken(subject);
            String newRefreshToken = jwtTokenProvider.createRefreshToken(subject);

            Claims newRefreshClaims = jwtTokenProvider.parseClaims(newRefreshToken);
            userService.rotateRefreshToken(oldJti, newRefreshClaims.getId(), null, subject, newRefreshClaims.getExpiration().toInstant());

            addCookie(response, accessCookieName, newAccessToken, Duration.ofMinutes(15));
            addCookie(response, refreshCookieName, newRefreshToken, Duration.ofDays(14));

            return ResponseEntity.ok(ApiResponse.message("토큰 갱신 완료"));
        } catch (JwtException | IllegalArgumentException e) {
            return ResponseEntity.status(401).body(ApiResponse.error("Refresh token 불일치/만료"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = "refresh", required = false) String refreshToken,
            HttpServletResponse response
    ) {
        if (refreshToken != null) {
            try {
                Claims claims = jwtTokenProvider.parseClaimsAllowExpired(refreshToken);
                userService.revokeRefreshToken(claims.getId());
            } catch (Exception ignored) {}
        }
        clearCookie(response, accessCookieName);
        clearCookie(response, refreshCookieName);
        return ResponseEntity.ok(ApiResponse.message("로그아웃 완료"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(
            @CookieValue(name = "access", required = false) String accessToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) token = authHeader.substring(7);
        else if (accessToken != null) token = accessToken;

        if (token == null) return ResponseEntity.status(401).body(ApiResponse.error("로그인이 필요합니다"));

        try {
            jwtTokenProvider.validateAccess(token);
            Claims claims = jwtTokenProvider.parseClaims(token);
            String email = claims.getSubject();

            User user = userService.findByEmailOptional(email)
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));

            return ResponseEntity.ok(ApiResponse.ok(user));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(ApiResponse.error("유효하지 않은 토큰입니다"));
        }
    }

    private void addCookie(HttpServletResponse response, String name, String value, Duration maxAge) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(true)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(maxAge)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    private void clearCookie(HttpServletResponse response, String name) {
        ResponseCookie cookie = ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }
}
