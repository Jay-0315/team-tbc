package com.tbcback.tbcback.login.application;

import com.tbcback.tbcback.login.domain.User;
import com.tbcback.tbcback.login.domain.UserService;
import com.tbcback.tbcback.login.dto.LoginRequest;
import com.tbcback.tbcback.login.dto.SignupRequest;
import com.tbcback.tbcback.login.dto.SignupResponse;
import com.tbcback.tbcback.login.dto.TokenPair;
import com.tbcback.tbcback.login.adapter.out.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class UserFacade {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    public SignupResponse signup(SignupRequest request) {
        User user = userService.signup(request);
        return new SignupResponse(user);
    }

    public TokenPair login(LoginRequest request) {
        User user = userService.loadAndVerifyCredentials(request.getEmail(), request.getPassword());
        String accessToken = jwtTokenProvider.createAccessToken(user.getEmail());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getEmail());
        String jti = jwtTokenProvider.getJti(refreshToken); // JwtTokenProvider 에 구현 필요
        Instant expiresAt = jwtTokenProvider.getExpiration(refreshToken); // JwtTokenProvider 에 구현 필요
        userService.persistRefreshToken(jti, user.getId(), user.getEmail(), expiresAt);
        return new TokenPair(accessToken, refreshToken);
    }
}
