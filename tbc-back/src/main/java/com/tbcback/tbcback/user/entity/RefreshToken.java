package com.tbcback.tbcback.user.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    private String jti;

    private Long userId;
    private String username;   // email (normalized)
    private Instant expiresAt;
    private boolean revoked;
    private Instant createdAt;
    private Instant updatedAt;

    protected RefreshToken() {}

    public static RefreshToken of(String jti, Long userId, String username,
                                  Instant expiresAt, boolean revoked,
                                  Instant createdAt, Instant updatedAt) {
        RefreshToken rt = new RefreshToken();
        rt.jti = jti;
        rt.userId = userId;
        rt.username = username;
        rt.expiresAt = expiresAt;
        rt.revoked = revoked;
        rt.createdAt = createdAt;
        rt.updatedAt = updatedAt;
        return rt;
    }

    public String getJti() { return jti; }
    public Long getUserId() { return userId; }
    public String getUsername() { return username; }
    public Instant getExpiresAt() { return expiresAt; }
    public boolean isRevoked() { return revoked; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setRevoked(boolean revoked) { this.revoked = revoked; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
