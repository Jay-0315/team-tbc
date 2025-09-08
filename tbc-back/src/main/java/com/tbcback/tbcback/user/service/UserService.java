package com.tbcback.tbcback.user.service;

import com.tbcback.tbcback.user.dto.SignupRequest;
import com.tbcback.tbcback.user.entity.RefreshToken;
import com.tbcback.tbcback.user.entity.User;
import com.tbcback.tbcback.user.repository.RefreshTokenRepository;
import com.tbcback.tbcback.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    // 이메일/아이디 정규화
    private String normalizeEmail(String email) { return email == null ? null : email.trim().toLowerCase(Locale.ROOT); }
    private String normalizeUsername(String username) { return username == null ? null : username.trim().toLowerCase(Locale.ROOT); }

    // 회원가입
    @Transactional
    public User signup(SignupRequest request) {
        String email = normalizeEmail(request.getEmail());
        String username = normalizeUsername(request.getUsername());

        if (userRepository.existsByEmail(email)) throw new IllegalArgumentException("email duplicated");
        if (userRepository.existsByUsername(username)) throw new IllegalArgumentException("username duplicated");

        User user = User.builder()
                .email(email)
                .username(username)
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .build();

        try {
            return userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("duplicated identity", e);
        }
    }

    // 로그인 자격 검증
    @Transactional(readOnly = true)
    public User loadAndVerifyCredentials(String rawUsername, String rawPassword) {
        String username = normalizeUsername(rawUsername);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        return user;
    }

    // 리프레시 토큰 최초 저장
    @Transactional
    public void persistRefreshToken(String jti, Long userId, String username, Instant expiresAt) {
        RefreshToken refreshToken = RefreshToken.builder()
                .jti(jti)
                .userId(userId)
                .username(normalizeUsername(username))
                .expiresAt(expiresAt)
                .revoked(false)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        refreshTokenRepository.save(refreshToken);
    }

    // 리프레시 토큰 사용 가능 확인
    @Transactional(readOnly = true)
    public void assertRefreshTokenUsable(String jti) {
        RefreshToken refreshToken = refreshTokenRepository.findByJtiAndRevokedFalse(jti)
                .orElseThrow(() -> new IllegalArgumentException("refresh invalid"));
        if (refreshToken.getExpiresAt().isBefore(Instant.now())) throw new IllegalArgumentException("refresh expired");
    }

    // 리프레시 회전
    @Transactional
    public void rotateRefreshToken(String oldJti, String newJti, Long userId, String username, Instant newExpiresAt) {
        refreshTokenRepository.findById(oldJti).ifPresent(refreshToken -> {
            refreshToken.setRevoked(true);
            refreshToken.setUpdatedAt(Instant.now());
            refreshTokenRepository.save(refreshToken);
        });
        persistRefreshToken(newJti, userId, username, newExpiresAt);
    }

    // 로그아웃 시 revoke
    @Transactional
    public void revokeRefreshToken(String jti) {
        refreshTokenRepository.findById(jti).ifPresent(refreshToken -> {
            refreshToken.setRevoked(true);
            refreshToken.setUpdatedAt(Instant.now());
            refreshTokenRepository.save(refreshToken);
        });
    }

    // 이메일로 유저 조회
    @Transactional(readOnly = true)
    public Optional<User> findByEmailOptional(String email) {
        return userRepository.findByEmail(normalizeEmail(email));
    }

    // 아이디로 유저 조회
    @Transactional(readOnly = true)
    public Optional<User> findByUsernameOptional(String username) {
        return userRepository.findByUsername(normalizeUsername(username));
    }

    // 아이디 찾기 처리(이메일만)
    @Transactional
    public void processFindUsername(String email) {
        String normalizedEmail = normalizeEmail(email);
        userRepository.findByEmail(normalizedEmail).ifPresent(user -> {
            // 여기서 이메일 발송 로직을 구현하면 된다
            // 실제 서비스에서는 user.getUsername()을 일부 마스킹하여 안내 메일 전송
        });
    }

    // 비밀번호 재설정 처리(이메일만)
    @Transactional
    public void processPasswordReset(String email) {
        String normalizedEmail = normalizeEmail(email);
        userRepository.findByEmail(normalizedEmail).ifPresent(user -> {
            // 여기서 비밀번호 재설정 토큰 생성 및 이메일 전송을 구현하면 된다
        });
        // 존재 여부와 상관없이 항상 동일 응답을 주기 위해 여기서는 예외를 던지지 않는다
    }
}
