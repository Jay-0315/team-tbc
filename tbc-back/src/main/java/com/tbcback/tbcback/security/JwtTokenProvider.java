package com.tbcback.tbcback.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

public class JwtTokenProvider {

    public enum TokenType { ACCESS, REFRESH }

    private final SecretKey key;
    private final long accessValidityMs;
    private final long refreshValidityMs;
    private final String issuer;
    private final String audience;
    private final long allowedClockSkewSec;

    public JwtTokenProvider(String secret, long accessSeconds, long refreshSeconds, String issuer, String audience, long allowedClockSkewSec) {
        byte[] raw = secret.getBytes(StandardCharsets.UTF_8);
        if (raw.length < 32) raw = strengthen(raw);
        this.key = Keys.hmacShaKeyFor(raw);
        this.accessValidityMs  = accessSeconds  * 1000L;
        this.refreshValidityMs = refreshSeconds * 1000L;
        this.issuer = issuer;
        this.audience = audience;
        this.allowedClockSkewSec = allowedClockSkewSec;
    }

    public String createAccessToken(String subject) {
        return createToken(subject, TokenType.ACCESS, Map.of("scope", "USER"));
    }

    public String createRefreshToken(String subject) {
        return createToken(subject, TokenType.REFRESH, Map.of());
    }

    private String createToken(String subject, TokenType type, Map<String, Object> extraClaims) {
        long now = System.currentTimeMillis();
        long validity = (type == TokenType.ACCESS) ? accessValidityMs : refreshValidityMs;
        JwtBuilder builder = Jwts.builder()
                .setId(UUID.randomUUID().toString())
                .setSubject(subject)
                .setIssuer(issuer)
                .setAudience(audience)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + validity))
                .claim("typ", type.name());
        if (extraClaims != null && !extraClaims.isEmpty()) builder.addClaims(extraClaims);
        return builder.signWith(key, SignatureAlgorithm.HS256).compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .requireIssuer(issuer)
                .requireAudience(audience)
                .setAllowedClockSkewSeconds(allowedClockSkewSec)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public Claims parseClaimsAllowExpired(String token) {
        try { return parseClaims(token); }
        catch (ExpiredJwtException e) { return e.getClaims(); }
    }

    public void validate(String token) { parseClaims(token); }
    public void validateAccess(String token) { assertType(parseClaims(token), TokenType.ACCESS); }
    public void validateRefresh(String token) { assertType(parseClaims(token), TokenType.REFRESH); }
    public String getSubject(String token) { return parseClaims(token).getSubject(); }
    public String getJti(String token) { return parseClaims(token).getId(); }

    private void assertType(Claims claims, TokenType expected) {
        String typ = (String) claims.get("typ");
        if (typ == null || !expected.name().equals(typ)) throw new JwtException("Invalid token type");
    }

    private byte[] strengthen(byte[] raw) {
        byte[] salt = new byte[32];
        new SecureRandom().nextBytes(salt);
        byte[] concat = new byte[raw.length + salt.length];
        System.arraycopy(raw, 0, concat, 0, raw.length);
        System.arraycopy(salt, 0, concat, raw.length, salt.length);
        return Base64.getEncoder().encode(concat);
    }
}
