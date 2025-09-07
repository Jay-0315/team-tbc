package com.tbcback.tbcback.config;

import com.tbcback.tbcback.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JwtBeansConfig {

    @Bean
    public JwtTokenProvider jwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-valid-seconds}") long accessSeconds,
            @Value("${jwt.refresh-token-valid-seconds}") long refreshSeconds,
            @Value("${jwt.issuer}") String issuer
    ) {
        return new JwtTokenProvider(secret, accessSeconds, refreshSeconds, issuer);
    }
}
