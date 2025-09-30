package com.tbc.login.adapter.out.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;
import java.security.Key;
<<<<<<< HEAD
import javax.crypto.SecretKey;
=======
>>>>>>> origin/dev
import java.time.Duration;
import java.util.Date;
import java.util.UUID;

public class JwtTokenProvider {

<<<<<<< HEAD
    private final SecretKey key;
=======
    private final Key key;
>>>>>>> origin/dev
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

    public String createAccessToken(String subject) {
        return createToken(subject, accessTtl, "access");
    }

    public String createRefreshToken(String subject) {
        return createToken(subject, refreshTtl, "refresh");
    }

    private String createToken(String subject, Duration ttl, String type) {
        long now = System.currentTimeMillis();
        Date iat = new Date(now);
        Date exp = new Date(now + ttl.toMillis());

        return Jwts.builder()
<<<<<<< HEAD
                .id(UUID.randomUUID().toString())
                .subject(subject)
                .issuedAt(iat)
                .expiration(exp)
                .claim("type", type)
                .signWith(key)
=======
                .setId(UUID.randomUUID().toString())
                .setSubject(subject)
                .setIssuedAt(iat)
                .setExpiration(exp)
                .claim("type", type)
                .signWith(key, SignatureAlgorithm.HS256)
>>>>>>> origin/dev
                .compact();
    }

    public void validateAccess(String token) {
        Claims claims = parseClaims(token);
        if (!"access".equals(claims.get("type", String.class))) {
            throw new JwtException("Not an access token");
        }
    }

    public void validateRefresh(String token) {
        Claims claims = parseClaims(token);
        if (!"refresh".equals(claims.get("type", String.class))) {
            throw new JwtException("Not a refresh token");
        }
    }

    public Claims parseClaims(String token) {
<<<<<<< HEAD
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
=======
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
>>>>>>> origin/dev
    }

    public Claims parseClaimsAllowExpired(String token) {
        try {
            return parseClaims(token);
        } catch (ExpiredJwtException e) {
            return e.getClaims();
        }
    }
}
