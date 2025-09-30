package com.tbc.login.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
<<<<<<< HEAD
    @Email @NotBlank
=======
    @Email
    @NotBlank
>>>>>>> origin/dev
    private String email;
    @NotBlank
    private String password;

<<<<<<< HEAD
    public String getEmail() { return email; }
    public String getPassword() { return password; }
=======
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
>>>>>>> origin/dev
}
