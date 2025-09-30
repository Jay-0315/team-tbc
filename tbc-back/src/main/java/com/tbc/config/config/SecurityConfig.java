<<<<<<< HEAD
package com.tbc.infrastructure.config;

import com.tbc.login.adapter.out.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
=======
package com.tbc.config.config;

import com.tbc.login.adapter.out.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import jakarta.servlet.http.HttpServletResponse;
>>>>>>> origin/dev
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
<<<<<<< HEAD

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
=======
    private final com.tbc.login.adapter.out.security.OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                         com.tbc.login.adapter.out.security.OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
>>>>>>> origin/dev
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

<<<<<<< HEAD
    /**
     * CORS 설정 (운영에서는 정확한 도메인을 allowedOrigins에 넣으세요)
     * - 개발 편의: allowedOriginPatterns로 localhost:* 같은 패턴 허용
     * - 운영: "https://app.yourdomain.com" 등 정확한 origin만 기입 권장
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 운영 환경에서는 아래 리스트를 정확한 도메인으로 바꿔주세요.
        // 예: Arrays.asList("https://app.example.com", "https://admin.example.com")
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "https://app.example.com",   // <--- production domain (교체)
                "http://localhost:*",
                "http://127.0.0.1:*"
        ));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));

        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Requested-With",
                "X-XSRF-TOKEN",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers"
        ));

        // JWT Bearer 방식(Authorization 헤더 사용)으로 통일할 경우 credentials는 false 권장.
        // 만약 쿠키 기반 인증을 사용한다면 true로 바꾸고 allowedOrigin을 정확히 명시하세요.
        configuration.setAllowCredentials(false);

=======
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:*",
                "http://127.0.0.1:*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(false);
>>>>>>> origin/dev
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Set-Cookie", "Content-Type"));
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
<<<<<<< HEAD
        source.registerCorsConfiguration("/**", configuration);
=======
        // 프런트가 /api/** 하위의 모든 경로를 호출하므로 심화 경로까지 허용
        source.registerCorsConfiguration("/api", configuration);
        source.registerCorsConfiguration("/api/", configuration);
        source.registerCorsConfiguration("/api/*", configuration);
        source.registerCorsConfiguration("/api/**", configuration);
        // OAuth2 경로도 CORS 허용
        source.registerCorsConfiguration("/oauth2/**", configuration);
        source.registerCorsConfiguration("/login/oauth2/**", configuration);
>>>>>>> origin/dev
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
<<<<<<< HEAD
                .csrf(AbstractHttpConfigurer::disable) // JWT stateless API면 비활성화 (운영 안전: 쿠키 사용시 재검토)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // Preflight 허용
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // WebSocket SockJS info 핸들러와 핸드셰이크 엔드포인트를 허용
                        // (SockJS의 /ws/info 는 초기 XHR이므로 permit 해둠; 실제 메시지 송수신은 CONNECT 시 토큰 검증)
                        .requestMatchers("/ws/**").permitAll()

                        // 인증 없이 허용해야 하는 경로들
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/users/check-email").permitAll()
                        .requestMatchers("/api/users/check-nickname").permitAll()
                        .requestMatchers("/api/groups/**").permitAll()
                        .requestMatchers("/api/events/**").permitAll()
                        // 모니터링 허용
                        .requestMatchers("/actuator/**").permitAll()

                        // 그 외는 인증 필요
                        .anyRequest().authenticated()
                )
=======
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/oauth2/authorization/google")
                        .successHandler(oAuth2LoginSuccessHandler)
                        .failureUrl("http://localhost:5173?error=oauth2_failed")
                )
                .authorizeHttpRequests(auth -> auth
                        // OPTIONS 요청 허용 - ** 패턴 대신 구체적인 패턴 사용
                        .requestMatchers(HttpMethod.OPTIONS, "/api").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/api/").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/api/auth").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/api/auth/").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/api/auth/*").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/api/users").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/api/users/").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/api/users/*").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/api/groups").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/api/groups/").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/api/groups/*").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/api/groups/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/api/events").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/api/events/").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/api/events/*").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/api/events/*/reviews").permitAll()

                        // WebSocket 허용 - ** 패턴 대신 구체적인 패턴 사용
                        .requestMatchers("/ws").permitAll()
                        .requestMatchers("/ws/").permitAll()
                        .requestMatchers("/ws/info").permitAll()
                        .requestMatchers("/ws/info/").permitAll()
                        .requestMatchers("/ws/info/*").permitAll()

                        // 정적 리소스 허용
                        .requestMatchers("/img/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        
                        // 인증 없이 허용하는 경로들
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/auth/signup").permitAll()
                        .requestMatchers("/api/auth/logout").permitAll()
                        
                        // OAuth2 로그인 관련 경로 허용
                        .requestMatchers("/oauth2/**").permitAll()
                        .requestMatchers("/login/oauth2/**").permitAll()

                        // 수정: /api/auth/me는 인증이 필요하도록 명시적으로 설정
                        .requestMatchers("/api/auth/me").authenticated()
                        .requestMatchers("/api/users/check-email").permitAll()
                        .requestMatchers("/api/users/check-nickname").permitAll()
                        // 그룹 목록/상세/하위 리소스는 공개 조회 허용, 조인 POST는 토큰 기반 유틸이 처리
                        .requestMatchers("/api/groups").permitAll()
                        .requestMatchers("/api/groups/").permitAll()
                        .requestMatchers("/api/groups/*").permitAll()
                        .requestMatchers("/api/groups/**").permitAll()
                        .requestMatchers("/api/events").permitAll()
                        .requestMatchers("/api/events/").permitAll()
                        .requestMatchers("/api/events/*").permitAll()
                        .requestMatchers("/actuator").permitAll()
                        .requestMatchers("/actuator/").permitAll()
                        .requestMatchers("/actuator/*").permitAll()

                        // 후기 작성은 인증 필요 (구체적인 패턴 사용)
                        .requestMatchers("/api/events/1/reviews").authenticated()
                        .requestMatchers("/api/events/2/reviews").authenticated()
                        .requestMatchers("/api/events/3/reviews").authenticated()
                        .requestMatchers("/api/events/4/reviews").authenticated()
                        .requestMatchers("/api/events/5/reviews").authenticated()
                        .requestMatchers("/api/events/6/reviews").authenticated()
                        .requestMatchers("/api/events/7/reviews").authenticated()
                        .requestMatchers("/api/events/8/reviews").authenticated()
                        .requestMatchers("/api/events/9/reviews").authenticated()
                        .requestMatchers("/api/events/10/reviews").authenticated()

                        // 그 외는 인증 필요
                        .anyRequest().authenticated())
>>>>>>> origin/dev
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> {
                            res.setHeader("WWW-Authenticate", "");
                            res.setContentType("application/json;charset=UTF-8");
                            res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                        })
                        .accessDeniedHandler((req, res, e) -> {
                            res.setHeader("WWW-Authenticate", "");
                            res.setContentType("application/json;charset=UTF-8");
                            res.sendError(HttpServletResponse.SC_FORBIDDEN, "Forbidden");
<<<<<<< HEAD
                        })
                )
                // JWT filter: 로그인/공개 경로는 permit 했더라도 필터 내부에서 요청을 직접 응답으로 마감하지 않도록 구현해야 함.
                // 권장: JwtAuthenticationFilter 내부에서 "/api/auth" 또는 "/ws" 경로는 스킵하도록 처리.
=======
                        }))
>>>>>>> origin/dev
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> origin/dev
