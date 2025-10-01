package com.tbc.infrastructure.config;

import com.tbc.login.adapter.out.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
// OAuth2 기능 비활성화
// import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
// import org.springframework.security.oauth2.client.web.HttpSessionOAuth2AuthorizationRequestRepository;
// import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    // OAuth2 기능 비활성화
    // private final com.tbc.login.adapter.out.security.OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    // private final com.tbc.login.adapter.out.security.OAuth2LoginFailureHandler oAuth2LoginFailureHandler;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        // this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
        // this.oAuth2LoginFailureHandler = oAuth2LoginFailureHandler;
    }

    /**
     * OAuth2 기능 비활성화
     */
    // @Bean
    // public AuthorizationRequestRepository<OAuth2AuthorizationRequest> authorizationRequestRepository() {
    //     return new HttpSessionOAuth2AuthorizationRequestRepository();
    // }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * CORS 설정 (운영에서는 정확한 도메인을 allowedOrigins에 넣으세요)
     * - 개발 편의: allowedOriginPatterns로 localhost:* 같은 패턴 허용
     * - 운영: "https://app.yourdomain.com" 등 정확한 origin만 기입 권장
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 리버스 프록시 환경을 위한 CORS 설정
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:*",        // 개발 환경
                "http://127.0.0.1:*",       // 개발 환경
                "http://*",                  // 리버스 프록시 환경 (모든 HTTP 도메인)
                "https://*"                  // 리버스 프록시 환경 (모든 HTTPS 도메인)
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
        configuration.setAllowCredentials(false);

        configuration.setExposedHeaders(Arrays.asList("Authorization", "Set-Cookie", "Content-Type"));
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                // OAuth2 기능 비활성화
                // .oauth2Login(oauth2 -> oauth2
                //         .successHandler(oAuth2LoginSuccessHandler)
                //         .failureHandler(oAuth2LoginFailureHandler)
                //         .authorizationEndpoint(auth -> auth
                //                 .baseUri("/oauth2/authorization")
                //                 .authorizationRequestRepository(authorizationRequestRepository())
                //         )
                //         .redirectionEndpoint(redirect -> redirect
                //                 .baseUri("/login/oauth2/code/*")
                //         )
                // )
                .authorizeHttpRequests(auth -> auth
                        // Preflight 허용
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // WebSocket 허용
                        .requestMatchers("/ws/**").permitAll()

                        // 정적 리소스 허용
                        .requestMatchers("/img/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        
                        // OAuth2 기능 비활성화
                        // .requestMatchers("/oauth2/**").permitAll()
                        // .requestMatchers("/login/oauth2/**").permitAll()
                        
                        // 인증 없이 허용해야 하는 경로들
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/auth/signup").permitAll()
                        .requestMatchers("/api/auth/logout").permitAll()
                        .requestMatchers("/api/auth/me").authenticated() // 명시적으로 인증 필요
                        .requestMatchers("/api/users/check-email").permitAll()
                        .requestMatchers("/api/users/check-nickname").permitAll()
                        .requestMatchers("/api/groups/**").permitAll()
                        .requestMatchers("/api/events/**").permitAll()
                        .requestMatchers("/api/images/upload").permitAll() // 이미지 업로드 허용
                        .requestMatchers("/api/nominatim/**").permitAll() // Nominatim 프록시 허용
                        .requestMatchers("/api/payments/**").permitAll() // 결제 관련 엔드포인트 허용
                        // 모니터링 허용
                        .requestMatchers("/actuator/**").permitAll()

                        // 그 외는 인증 필요
                        .anyRequest().authenticated()
                )
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
                        })
                )
                // JWT filter: 로그인/공개 경로는 permit 했더라도 필터 내부에서 요청을 직접 응답으로 마감하지 않도록 구현해야 함.
                // 권장: JwtAuthenticationFilter 내부에서 "/api/auth" 또는 "/ws" 경로는 스킵하도록 처리.
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
