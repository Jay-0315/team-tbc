package com.tbcback.tbcback.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SignupResponse {
    private Long id;
    private String email;
    private String username;
    private String nickname;
}
