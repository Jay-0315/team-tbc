package com.tbcback.tbcback.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Value("${app.cookie.domain:}")
    private String cookieDomain;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site:None}")
    private String cookieSameSite;

    @Value("${app.cookie.access-name:access}")
    private String accessCookieName;

    @Value("${app.cookie.refresh-name:refresh}")
    private String refreshCookieName;

    @Value("${app.oauth.callback-path:/oauth-callback}")
    private String callbackPath;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        DefaultOAuth2User principal = (DefaultOAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = principal.getAttributes();

        String subject = resolveSubject(attributes);

        String accessToken = jwtTokenProvider.createAccessToken(subject);
        String refreshToken = jwtTokenProvider.createRefreshToken(subject);

        addHttpOnlyCookie(response, accessCookieName, accessToken, Duration.ofMinutes(15));
        addHttpOnlyCookie(response, refreshCookieName, refreshToken, Duration.ofDays(14));

        String redirect = UriComponentsBuilder.fromHttpUrl(frontendBaseUrl).path(callbackPath).build(true).toUriString();
        getRedirectStrategy().sendRedirect(request, response, redirect);
    }

    private String resolveSubject(Map<String, Object> attributes) {
        return Optional.ofNullable(asString(attributes.get("email")))
                .or(() -> Optional.ofNullable(asString(attributes.get("sub"))))
                .or(() -> Optional.ofNullable(asString(attributes.get("id"))))
                .orElseThrow(() -> new IllegalStateException("Cannot resolve subject from OAuth2 attributes"));
    }

    private String asString(Object value) { return value == null ? null : String.valueOf(value); }

    private void addHttpOnlyCookie(HttpServletResponse response, String name, String value, Duration maxAge) {
        ResponseCookie.Builder builder = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(maxAge)
                .sameSite(cookieSameSite);
        if (cookieDomain != null && !cookieDomain.isBlank()) builder.domain(cookieDomain);
        response.addHeader("Set-Cookie", builder.build().toString());
    }
}
