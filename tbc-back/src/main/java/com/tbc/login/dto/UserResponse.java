package com.tbc.login.dto;

import com.tbc.login.domain.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String realName;
    private String nickname;

    public UserResponse(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.realName = user.getRealName();
        this.nickname = user.getNickname();
    }
} 