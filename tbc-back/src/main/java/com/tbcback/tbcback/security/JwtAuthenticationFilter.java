package com.tbcback.tbcback.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    private static final List<String> WHITELIST = List.of(
            "/api/auth/", "/actuator", "/v3/api-docs", "/swagger"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        try {
            if (!shouldSkip(request)) {
                String token = resolveAccessToken(request);
                if (token != null) {
                    jwtTokenProvider.validateAccess(token);
                    Claims claims = jwtTokenProvider.parseClaims(token);
                    String username = claims.getSubject();

                    var authorities = extractAuthorities(claims);
                    var authentication = new UsernamePasswordAuthenticationToken(username, null, authorities);
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (ExpiredJwtException e) {
            log.debug("JWT expired: {}", e.getMessage());
        } catch (JwtException e) {
            log.warn("Invalid JWT: {}", e.getMessage());
        } catch (Exception e) {
            log.error("JWT filter error", e);
        }
        chain.doFilter(request, response);
    }

    private boolean shouldSkip(HttpServletRequest request) {
        String path = request.getRequestURI();
        return WHITELIST.stream().anyMatch(path::startsWith);
    }

    private String resolveAccessToken(HttpServletRequest request) {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")) return header.substring(7);
        if (request.getCookies() != null) {
            return Arrays.stream(request.getCookies())
                    .filter(c -> "access".equals(c.getName()))
                    .map(Cookie::getValue)
                    .findFirst().orElse(null);
        }
        return null;
    }

    private Collection<SimpleGrantedAuthority> extractAuthorities(Claims claims) {
        Object scope = claims.get("scope");
        if (scope == null) return List.of();
        return Arrays.stream(String.valueOf(scope).split(" "))
                .filter(s -> !s.isBlank())
                .map(s -> s.startsWith("ROLE_") ? s : "ROLE_" + s.toUpperCase())
                .map(SimpleGrantedAuthority::new)
                .toList();
    }
}
