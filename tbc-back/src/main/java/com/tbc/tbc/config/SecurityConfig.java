package com.tbc.tbc.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class SecurityConfig {

    @Bean
    @org.springframework.core.annotation.Order(0) // ★ 최우선 체인
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())                    // CSRF 완전 끔
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                // Toss webhook (PG 서버 → 우리 서버 호출)
                                "/payments/webhook/**",
                                // 결제 API (프론트에서 직접 호출)
                                "/payments/**",
                                // Swagger / 문서
                                "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html",
                                // Actuator (헬스체크, 모니터링)
                                "/actuator/**",
                                // 관리자 및 모니터링
                                "/monitoring/**", "/admin/**"
                        ).permitAll()
                        // 나머지는 인증 필요
                        .anyRequest().authenticated()
                )
                .formLogin(f -> f.disable())
                .httpBasic(b -> b.disable());
        return http.build();
    }

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("http://localhost:5173"); // React 개발 서버
        config.addAllowedMethod("*"); // 모든 HTTP 메서드 허용
        config.addAllowedHeader("*"); // 모든 헤더 허용
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

}
