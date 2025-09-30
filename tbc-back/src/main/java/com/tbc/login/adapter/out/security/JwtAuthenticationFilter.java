package com.tbc.login.adapter.out.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.*;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    private static final List<String> WHITELIST_PREFIXES = List.of(
<<<<<<< HEAD
            "/api/auth", "/actuator"
    );
=======
            "/api/auth/login", "/api/auth/signup", "/api/auth/register", "/actuator");
>>>>>>> origin/dev

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
<<<<<<< HEAD
                                    HttpServletResponse response,
                                    FilterChain chain)
=======
            HttpServletResponse response,
            FilterChain chain)
>>>>>>> origin/dev
            throws ServletException, IOException {
        try {
            if (!shouldSkip(request)) {
                String token = resolveAccessToken(request);
                if (token != null) {
                    jwtTokenProvider.validateAccess(token);
                    Claims claims = jwtTokenProvider.parseClaims(token);
                    String username = claims.getSubject();

                    var authorities = extractAuthorities(claims);
<<<<<<< HEAD
                    var authentication =
                            new UsernamePasswordAuthenticationToken(username, null, authorities);
=======
                    var authentication = new UsernamePasswordAuthenticationToken(username, null, authorities);
>>>>>>> origin/dev
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
<<<<<<< HEAD
        } catch (Exception ignored) {}
=======
        } catch (Exception e) {
            // JWT 토큰 검증 실패 시 로깅
            System.err.println("JWT Authentication failed: " + e.getMessage());
            e.printStackTrace();
        }
>>>>>>> origin/dev
        chain.doFilter(request, response);
    }

    private boolean shouldSkip(HttpServletRequest request) {
<<<<<<< HEAD
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;
        String path = request.getRequestURI();
        for (String prefix : WHITELIST_PREFIXES) {
            if (path.startsWith(prefix)) return true;
=======
        if ("OPTIONS".equalsIgnoreCase(request.getMethod()))
            return true;
        String path = request.getRequestURI();
        for (String prefix : WHITELIST_PREFIXES) {
            if (path.startsWith(prefix))
                return true;
>>>>>>> origin/dev
        }
        return false;
    }

    private String resolveAccessToken(HttpServletRequest request) {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
<<<<<<< HEAD
        if (header != null && header.startsWith("Bearer ")) return header.substring(7);
=======
        if (header != null && header.startsWith("Bearer "))
            return header.substring(7);
>>>>>>> origin/dev

        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            return Arrays.stream(cookies)
                    .filter(c -> "access".equals(c.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);
        }
        return null;
    }

    private Collection<SimpleGrantedAuthority> extractAuthorities(Claims claims) {
        Object scope = claims.get("scope");
<<<<<<< HEAD
        if (scope == null) return List.of();
=======
        if (scope == null)
            return List.of();
>>>>>>> origin/dev
        return Arrays.stream(String.valueOf(scope).split(" "))
                .filter(s -> !s.isBlank())
                .map(s -> s.startsWith("ROLE_") ? s : "ROLE_" + s.toUpperCase())
                .map(SimpleGrantedAuthority::new)
                .toList();
    }
}
