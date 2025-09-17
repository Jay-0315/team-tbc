package com.tbc.login.domain;

import com.tbc.login.dto.SignupRequest;
import com.tbc.login.adapter.out.persistence.RefreshTokenRepository;
import com.tbc.login.adapter.out.persistence.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Locale;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    @Transactional
    public User signup(SignupRequest request) {
        String email = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(email))
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다");
        if (userRepository.existsByNickname(request.getNickname()))
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다");

        User user = User.of(
                email,
                request.getRealName(),
                passwordEncoder.encode(request.getPassword()),
                request.getNickname()
        );

        try {
            return userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("중복된 정보가 있습니다", e);
        }
    }

    @Transactional(readOnly = true)
    public User loadAndVerifyCredentials(String rawEmail, String rawPassword) {
        if (rawEmail == null || rawEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("이메일을 입력해주세요");
        }
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("비밀번호를 입력해주세요");
        }

        String email = normalizeEmail(rawEmail);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다"));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다");
        }
        return user;
    }

    @Transactional
    public void persistRefreshToken(String jti, Long userId, String email, Instant expiresAt) {
        RefreshToken refreshToken = RefreshToken.of(
                jti, userId, normalizeEmail(email), expiresAt, false, Instant.now(), Instant.now()
        );
        refreshTokenRepository.save(refreshToken);
    }

    @Transactional(readOnly = true)
    public void assertRefreshTokenUsable(String jti) {
        RefreshToken refreshToken = refreshTokenRepository.findByJtiAndRevokedFalse(jti)
                .orElseThrow(() -> new IllegalArgumentException("refresh invalid"));
        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("refresh expired");
        }
    }

    @Transactional
    public void rotateRefreshToken(String oldJti, String newJti, Long userId, String email, Instant newExpiresAt) {
        refreshTokenRepository.findById(oldJti).ifPresent(rt -> {
            rt.setRevoked(true);
            rt.setUpdatedAt(Instant.now());
            refreshTokenRepository.save(rt);
        });
        persistRefreshToken(newJti, userId, email, newExpiresAt);
    }

    @Transactional
    public void revokeRefreshToken(String jti) {
        refreshTokenRepository.findById(jti).ifPresent(rt -> {
            rt.setRevoked(true);
            rt.setUpdatedAt(Instant.now());
            refreshTokenRepository.save(rt);
        });
    }

    @Transactional(readOnly = true)
    public Optional<User> findByEmailOptional(String email) {
        return userRepository.findByEmail(normalizeEmail(email));
    }

    @Transactional(readOnly = true)
    public Optional<User> findByNicknameOptional(String nickname) {
        return userRepository.findByNickname(nickname);
    }

    @Transactional(readOnly = true)
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(normalizeEmail(email));
    }

    @Transactional(readOnly = true)
    public boolean isNicknameAvailable(String nickname) {
        return !userRepository.existsByNickname(nickname);
    }
}
