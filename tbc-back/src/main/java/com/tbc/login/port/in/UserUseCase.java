package com.tbcback.tbcback.login.port.in;

import com.tbcback.tbcback.login.dto.SignupRequest;
import com.tbcback.tbcback.login.dto.SignupResponse;
import com.tbcback.tbcback.login.dto.LoginRequest;

public interface UserUseCase {
    SignupResponse signup(SignupRequest request);
    void login(LoginRequest request);
}
