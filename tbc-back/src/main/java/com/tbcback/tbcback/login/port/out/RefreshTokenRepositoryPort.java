package com.tbcback.tbcback.login.port.out;

import com.tbcback.tbcback.login.domain.RefreshToken;

import java.util.Optional;

public interface RefreshTokenRepositoryPort {
    RefreshToken save(RefreshToken refreshToken);
    Optional<RefreshToken> findById(String jti);
    Optional<RefreshToken> findByJtiAndRevokedFalse(String jti);
}
