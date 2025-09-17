package com.tbc.config.config;

import com.tbc.login.adapter.out.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class JwtBeansConfig {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-expiration-minutes:15}")
    private long accessMinutes;

    @Value("${jwt.refresh-expiration-days:14}")
    private long refreshDays;

    @Bean
    public JwtTokenProvider jwtTokenProvider() {
        return new JwtTokenProvider(
                secret,
                Duration.ofMinutes(accessMinutes),
                Duration.ofDays(refreshDays)
        );
    }
}
