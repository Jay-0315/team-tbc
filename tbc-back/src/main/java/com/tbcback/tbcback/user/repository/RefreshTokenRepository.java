package com.tbcback.tbcback.user.repository;

import com.tbcback.tbcback.user.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {
    Optional<RefreshToken> findByJtiAndRevokedFalse(String jti);
    long deleteByExpiresAtBefore(Instant now);
}
