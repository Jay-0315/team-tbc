package com.tbcback.tbcback.login.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ResetPasswordRequest {
    @Email @NotBlank
    private String email;
    public String getEmail() { return email; }
}
