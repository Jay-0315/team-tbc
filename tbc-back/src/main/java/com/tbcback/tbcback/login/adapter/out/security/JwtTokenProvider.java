package com.tbcback.tbcback.login.adapter.out.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

public class JwtTokenProvider {

    private final Key key;
    private final Duration accessTtl;
    private final Duration refreshTtl;

    public JwtTokenProvider(String secret, Duration accessTtl, Duration refreshTtl) {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("jwt.secret must be at least 32 bytes");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTtl = accessTtl;
        this.refreshTtl = refreshTtl;
    }

    // AccessToken 생성
    public String createAccessToken(String subject) {
        return createToken(subject, accessTtl, "access");
    }

    // RefreshToken 생성
    public String createRefreshToken(String subject) {
        return createToken(subject, refreshTtl, "refresh");
    }

    // 공통 토큰 생성 메서드
    private String createToken(String subject, Duration ttl, String type) {
        long now = System.currentTimeMillis();
        Date iat = new Date(now);
        Date exp = new Date(now + ttl.toMillis());

        return Jwts.builder()
                .setId(UUID.randomUUID().toString()) // JTI
                .setSubject(subject)                 // 사용자 식별값 (이메일 등)
                .setIssuedAt(iat)                    // 발급 시간
                .setExpiration(exp)                  // 만료 시간
                .claim("type", type)                 // 토큰 타입 (access / refresh)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // AccessToken 검증
    public void validateAccess(String token) {
        Claims claims = parseClaims(token);
        if (!"access".equals(claims.get("type", String.class))) {
            throw new JwtException("Not an access token");
        }
    }

    // RefreshToken 검증
    public void validateRefresh(String token) {
        Claims claims = parseClaims(token);
        if (!"refresh".equals(claims.get("type", String.class))) {
            throw new JwtException("Not a refresh token");
        }
    }

    // 공통 Claims 파싱
    public Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // 만료된 토큰도 Claims 추출 (재발급 시 사용)
    public Claims parseClaimsAllowExpired(String token) {
        try {
            return parseClaims(token);
        } catch (ExpiredJwtException e) {
            return e.getClaims();
        }
    }

    // JTI 추출
    public String getJti(String token) {
        Claims claims = parseClaimsAllowExpired(token);
        return claims.getId();
    }

    // 만료 시각 추출
    public Instant getExpiration(String token) {
        Claims claims = parseClaimsAllowExpired(token);
        return claims.getExpiration().toInstant();
    }
}
