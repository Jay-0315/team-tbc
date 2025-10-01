package com.tbc.config.config;

import com.tbc.login.adapter.out.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import jakarta.servlet.http.HttpServletResponse;
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
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.client.web.HttpSessionOAuth2AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final com.tbc.login.adapter.out.security.OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final com.tbc.login.adapter.out.security.OAuth2LoginFailureHandler oAuth2LoginFailureHandler;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                         com.tbc.login.adapter.out.security.OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler,
                         com.tbc.login.adapter.out.security.OAuth2LoginFailureHandler oAuth2LoginFailureHandler) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
        this.oAuth2LoginFailureHandler = oAuth2LoginFailureHandler;
    }

    /**
     * OAuth2 Authorization Request Repository
     * 세션 기반으로 OAuth2 인증 요청 정보를 저장
     */
    @Bean
    public AuthorizationRequestRepository<OAuth2AuthorizationRequest> authorizationRequestRepository() {
        return new HttpSessionOAuth2AuthorizationRequestRepository();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:*",
                "http://127.0.0.1:*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Set-Cookie", "Content-Type"));
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 프런트가 /api/** 하위의 모든 경로를 호출하므로 심화 경로까지 허용
        source.registerCorsConfiguration("/api", configuration);
        source.registerCorsConfiguration("/api/", configuration);
        source.registerCorsConfiguration("/api/*", configuration);
        source.registerCorsConfiguration("/api/**", configuration);
        // OAuth2 경로도 CORS 허용
        source.registerCorsConfiguration("/oauth2/**", configuration);
        source.registerCorsConfiguration("/login/oauth2/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                        .sessionFixation().newSession()
                )
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                // OAuth2 로그인 설정
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oAuth2LoginSuccessHandler)
                        .failureHandler(oAuth2LoginFailureHandler)
                        .authorizationEndpoint(auth -> auth
                                .baseUri("/oauth2/authorization")
                                .authorizationRequestRepository(authorizationRequestRepository())
                        )
                        .redirectionEndpoint(redirect -> redirect
                                .baseUri("/login/oauth2/code/*")
                        )
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
                            .requestMatchers(HttpMethod.OPTIONS, "/api/images").permitAll()
                            .requestMatchers(HttpMethod.OPTIONS, "/api/images/").permitAll()
                            .requestMatchers(HttpMethod.OPTIONS, "/api/images/*").permitAll()

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
                        .requestMatchers("/api/oauth2/**").permitAll()

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
                        // 이미지 업로드 허용
                        .requestMatchers("/api/images/upload").permitAll()
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
                        }))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}