package com.tbc_back.tbc_back.mypage.adapters.in.web.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MyProfileDto {
    private String userId;
    private String email;
    private String username;
    private String name;
}
