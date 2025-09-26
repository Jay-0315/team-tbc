package com.tbc.login.port.in;

import com.tbc.login.dto.SignupRequest;
import com.tbc.login.dto.SignupResponse;
import com.tbc.login.dto.LoginRequest;

public interface UserUseCase {
    SignupResponse signup(SignupRequest request);
    void login(LoginRequest request);
}
