package com.tbcback.tbcback.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class LoginRequest {
    // 아이디
    @NotBlank(message = "아이디는 필수입니다.")
    private String username;

    // 비밀번호
    @NotBlank(message = "비밀번호는 필수입니다.")
    private String password;
}
