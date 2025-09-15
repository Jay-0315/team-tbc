package com.tbcback.tbcback.login.adapter.out.persistence;

import com.tbcback.tbcback.login.domain.RefreshToken;
import com.tbcback.tbcback.login.port.out.RefreshTokenRepositoryPort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository
        extends JpaRepository<RefreshToken, String>, RefreshTokenRepositoryPort {

    @Override
    Optional<RefreshToken> findByJtiAndRevokedFalse(String jti);
}
