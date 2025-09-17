package com.tbc.login.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Getter
@NoArgsConstructor
public class RefreshToken {

    @Id
    private String jti;

    private Long userId;
    private String email;
    private Instant expiresAt;
    private boolean revoked;
    private Instant createdAt;
    private Instant updatedAt;

    private RefreshToken(String jti, Long userId, String email,
                         Instant expiresAt, boolean revoked,
                         Instant createdAt, Instant updatedAt) {
        this.jti = jti;
        this.userId = userId;
        this.email = email;
        this.expiresAt = expiresAt;
        this.revoked = revoked;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static RefreshToken of(String jti, Long userId, String email,
                                  Instant expiresAt, boolean revoked,
                                  Instant createdAt, Instant updatedAt) {
        return new RefreshToken(jti, userId, email, expiresAt, revoked, createdAt, updatedAt);
    }

    public void setRevoked(boolean revoked) { this.revoked = revoked; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
