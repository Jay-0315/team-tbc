package com.tbc.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/swagger-ui.html",     // 구버전 경로
                                "/swagger-ui/**",       // 실제 UI 리소스
                                "/v3/api-docs",         // OpenAPI 메인 엔드포인트
                                "/v3/api-docs/**",      // 서브 리소스들
                                "/api/health/**",
                                "/chat/**",
                                "/api/health/**"
                        ).permitAll()
                        .anyRequest().permitAll() // 초기엔 전부 오픈
                );
        return http.build();
    }
}
