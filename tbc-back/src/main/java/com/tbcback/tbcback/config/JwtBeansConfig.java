package com.tbcback.tbcback.config;

import com.tbcback.tbcback.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JwtBeansConfig {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-token-valid-seconds}")
    private long accessSeconds;

    @Value("${jwt.refresh-token-valid-seconds}")
    private long refreshSeconds;

    @Value("${jwt.issuer}")
    private String issuer;

    // aud는 간단히 서비스 식별자 사용
    private static final String DEFAULT_AUDIENCE = "tbc-app";

    @Bean
    public JwtTokenProvider jwtTokenProvider() {
        return new JwtTokenProvider(secret, accessSeconds, refreshSeconds, issuer, DEFAULT_AUDIENCE, 60);
    }
}
