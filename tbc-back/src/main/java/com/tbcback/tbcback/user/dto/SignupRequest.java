package com.tbcback.tbcback.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SignupRequest {

    @Email(message = "올바른 이메일 형식이어야 합니다.")
    @NotBlank(message = "이메일은 공백일 수 없습니다.")
    private String email;

    @NotBlank(message = "비밀번호는 공백일 수 없습니다.")
    @Size(min = 8, message = "비밀번호는 최소 8자 이상이어야 합니다.")
    private String password;

    @NotBlank(message = "이름은 공백일 수 없습니다.")
    private String realName;

    @NotBlank(message = "닉네임은 공백일 수 없습니다.")
    private String nickname;

    // 기본 생성자 (Jackson 역직렬화용)
    public SignupRequest() {}

    // 전체 필드 생성자 (테스트용/편의용)
    public SignupRequest(String email, String password, String realName, String nickname) {
        this.email = email;
        this.password = password;
        this.realName = realName;
        this.nickname = nickname;
    }

    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getRealName() { return realName; }
    public String getNickname() { return nickname; }

    // 필요하다면 setter도 추가 가능
}
