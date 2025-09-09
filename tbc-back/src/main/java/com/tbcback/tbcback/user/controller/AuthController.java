package com.tbcback.tbcback.user.controller;

import com.tbcback.tbcback.security.JwtTokenProvider;
import com.tbcback.tbcback.user.dto.*;
import com.tbcback.tbcback.user.entity.User;
import com.tbcback.tbcback.user.service.UserService;  // ← 빠졌던 import 추가
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site:None}")
    private String cookieSameSite;

    @Value("${app.cookie.access-name:access}")
    private String accessCookieName;

    @Value("${app.cookie.refresh-name:refresh}")
    private String refreshCookieName;

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<SignupResponse>> signup(@Valid @RequestBody SignupRequest request) {
        User user = userService.signup(request);
        SignupResponse body = new SignupResponse(user.getId(), user.getEmail(), user.getUsername(), user.getNickname());
        return ResponseEntity.created(URI.create("/api/users/" + user.getId())).body(ApiResponse.ok(body));
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Void>> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        User user = userService.loadAndVerifyCredentials(request.getUsername(), request.getPassword());

        String accessToken = jwtTokenProvider.createAccessToken(user.getUsername());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getUsername());

        Claims refreshClaims = jwtTokenProvider.parseClaims(refreshToken);
        String refreshJti = refreshClaims.getId();
        userService.persistRefreshToken(refreshJti, user.getId(), user.getUsername(), refreshClaims.getExpiration().toInstant());

        addCookie(response, accessCookieName, accessToken, Duration.ofMinutes(15));
        addCookie(response, refreshCookieName, refreshToken, Duration.ofDays(14));

        return ResponseEntity.ok(ApiResponse.message("로그인 성공"));
    }

    // 리프레시
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Void>> refresh(@CookieValue(name = "refresh", required = false) String refreshToken,
                                                     HttpServletResponse response) {
        if (refreshToken == null) return ResponseEntity.status(401).body(ApiResponse.message("Refresh token 없음"));
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
            return ResponseEntity.status(401).body(ApiResponse.message("Refresh token 불일치/만료"));
        }
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@CookieValue(name = "refresh", required = false) String refreshToken,
                                                    HttpServletResponse response) {
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

    // 아이디 찾기(이메일만)
    @PostMapping("/find-id")
    public ResponseEntity<ApiResponse<Void>> findId(@Valid @RequestBody FindIdRequest request) {
        userService.processFindUsername(request.getEmail());
        return ResponseEntity.ok(ApiResponse.message("이메일로 안내를 전송했습니다."));
    }

    // 비밀번호 재설정(이메일만)
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        userService.processPasswordReset(request.getEmail());
        return ResponseEntity.ok(ApiResponse.message("비밀번호 재설정 안내를 전송했습니다."));
    }

    // 공용 쿠키 설정
    private void addCookie(HttpServletResponse response, String name, String value, Duration maxAge) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(maxAge)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    // 공용 쿠키 삭제
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
