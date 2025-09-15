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

@Service
@RequiredArgsConstructor
public class UserFacade {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    public SignupResponse signup(SignupRequest request) {
        User user = userService.signup(request); // ✅ createUser → signup
        return new SignupResponse(user);
    }

    public TokenPair login(LoginRequest request) {
        User user = userService.loadAndVerifyCredentials(request.getEmail(), request.getPassword()); // ✅ authenticate → loadAndVerifyCredentials
        String accessToken = jwtTokenProvider.createAccessToken(user.getEmail());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getEmail());
        return new TokenPair(accessToken, refreshToken);
    }
}
