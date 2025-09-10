package com.tbcback.tbcback.user.dto;

public class TokenPair {
    private String accessToken;
    private String refreshToken;

    public TokenPair() {}
    public TokenPair(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    public String getAccessToken() { return accessToken; }
    public String getRefreshToken() { return refreshToken; }
}
