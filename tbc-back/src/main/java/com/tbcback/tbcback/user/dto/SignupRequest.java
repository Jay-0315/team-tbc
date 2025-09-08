package com.tbcback.tbcback.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class SignupRequest {
    // 이메일은 필수
    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "이메일 형식이 아닙니다.")
    private String email;

    // 아이디는 소문자/숫자 조합 추천(규칙은 자유)
    @NotBlank(message = "아이디는 필수입니다.")
    @Size(min = 3, max = 50, message = "아이디는 3~50자입니다.")
    private String username;

    // 비밀번호 최소 길이 예시
    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 8, max = 100, message = "비밀번호는 8자 이상입니다.")
    private String password;

    // 닉네임은 선택
    private String nickname;
}
