package com.tbcback.tbcback.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class SignupRequest {
    @Email @NotBlank
    private String email;
    @NotBlank
    private String password;
    @NotBlank
    private String realName;
    @NotBlank
    private String nickname;

    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getRealName() { return realName; }
    public String getNickname() { return nickname; }
}
