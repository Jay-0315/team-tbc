package com.tbcback.tbcback.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SignupResponse {
    // 가입 결과 반환용
    private Long id;
    private String email;
    private String username;
    private String nickname;
}
