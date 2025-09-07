package com.tbcback.tbcback.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignupRequest {
    @Email @NotBlank
    private String email;

    @NotBlank
    private String phone;

    @NotBlank
    private String username;

    @NotBlank
    private String password;

    @NotBlank
    private String nickname;
}
