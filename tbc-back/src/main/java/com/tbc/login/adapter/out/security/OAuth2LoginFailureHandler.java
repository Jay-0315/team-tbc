package com.tbc.login.adapter.out.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2LoginFailureHandler.class);

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {
        
        log.error("=== OAuth2 Login Failure ===");
        log.error("Request URL: {}", request.getRequestURL());
        log.error("Request URI: {}", request.getRequestURI());
        log.error("Query String: {}", request.getQueryString());
        log.error("Exception: {}", exception.getMessage());
        log.error("Exception Class: {}", exception.getClass().getName());
        
        // 프론트엔드로 실패 리다이렉트
        response.sendRedirect("http://localhost:5173?error=oauth2_failed");
    }
}
