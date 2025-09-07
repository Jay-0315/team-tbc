package com.tbcback.tbcback.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        DefaultOAuth2User principal = (DefaultOAuth2User) authentication.getPrincipal();
        String email = (String) principal.getAttributes().get("email");
        String subject = email != null ? email : "googleUser";

        String access  = jwtTokenProvider.createAccessToken(subject);
        String refresh = jwtTokenProvider.createRefreshToken(subject);

        String redirect = "http://localhost:5173/oauth-callback"
                + "?access=" + URLEncoder.encode(access, StandardCharsets.UTF_8)
                + "&refresh=" + URLEncoder.encode(refresh, StandardCharsets.UTF_8);
        getRedirectStrategy().sendRedirect(request, response, redirect);
    }
}
