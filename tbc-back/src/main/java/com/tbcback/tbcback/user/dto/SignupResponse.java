package com.tbcback.tbcback.user.dto;

public class SignupResponse {
    private Long id;
    private String email;
    private String realName;
    private String nickname;

    public SignupResponse(Long id, String email, String realName, String nickname) {
        this.id = id;
        this.email = email;
        this.realName = realName;
        this.nickname = nickname;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getRealName() { return realName; }
    public String getNickname() { return nickname; }
}
