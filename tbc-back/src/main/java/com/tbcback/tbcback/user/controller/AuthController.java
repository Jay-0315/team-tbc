package com.tbcback.tbcback.user.controller;

import com.tbcback.tbcback.security.JwtTokenProvider;
import com.tbcback.tbcback.user.dto.*;
import com.tbcback.tbcback.user.entity.User;
import com.tbcback.tbcback.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest signupRequest) {
        User savedUser = userService.signup(signupRequest);
        return ResponseEntity.ok(
                new SignupResponse(savedUser.getId(), savedUser.getEmail(),
                        savedUser.getUsername(), savedUser.getNickname())
        );
    }

    // 로그인 → Access/Refresh 발급
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        User user = userService.findByUsername(loginRequest.getUsername());
        if (user == null || !passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
        String accessToken  = jwtTokenProvider.createAccessToken(user.getUsername());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getUsername());
        return ResponseEntity.ok(new TokenPair(accessToken, refreshToken));
    }

    // 리프레시 → 새 Access 발급
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody RefreshRequest refreshRequest) {
        if (!jwtTokenProvider.validate(refreshRequest.getRefreshToken())) {
            return ResponseEntity.status(401).body("Invalid refresh token");
        }
        String subject = jwtTokenProvider.parseClaims(refreshRequest.getRefreshToken()).getSubject();
        String newAccessToken = jwtTokenProvider.createAccessToken(subject);
        return ResponseEntity.ok(new TokenPair(newAccessToken, refreshRequest.getRefreshToken()));
    }

    // 아이디 찾기 (email 또는 phone)
    @PostMapping("/find-id")
    public ResponseEntity<?> findId(@RequestParam String emailOrPhone) {
        String username = userService.findUsernameByEmailOrPhone(emailOrPhone);
        return ResponseEntity.ok(username == null ? "" : username);
    }

    // 비밀번호 초기화
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String username) {
        String temporaryPassword = userService.resetPassword(username);
        return ResponseEntity.ok(temporaryPassword);
    }
}
