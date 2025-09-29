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

import java.util.Arrays;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
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
        configuration.setAllowCredentials(false);
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Set-Cookie", "Content-Type"));
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // CORS 설정에서 ** 패턴 사용 시 문제가 발생할 수 있으므로 구체적인 패턴으로 변경
        source.registerCorsConfiguration("/api", configuration);
        source.registerCorsConfiguration("/api/", configuration);
        source.registerCorsConfiguration("/api/*", configuration);
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

                        // 인증 없이 허용하는 경로들
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/auth/signup").permitAll()
                        .requestMatchers("/api/auth/logout").permitAll()

                        // 수정: /api/auth/me는 인증이 필요하도록 명시적으로 설정
                        .requestMatchers("/api/auth/me").authenticated()
                        .requestMatchers("/api/users/check-email").permitAll()
                        .requestMatchers("/api/users/check-nickname").permitAll()
                        .requestMatchers("/api/groups").permitAll()
                        .requestMatchers("/api/groups/").permitAll()
                        .requestMatchers("/api/groups/*").permitAll()
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