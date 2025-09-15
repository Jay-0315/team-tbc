package com.tbcback.tbcback.login.dto;

import com.tbcback.tbcback.login.domain.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SignupResponse {
    private Long id;
    private String email;
    private String realName;
    private String nickname;

    public SignupResponse(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.realName = user.getRealName();
        this.nickname = user.getNickname();
    }
}
