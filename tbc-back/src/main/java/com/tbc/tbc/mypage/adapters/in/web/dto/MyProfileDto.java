package com.tbc_back.tbc_back.mypage.adapters.in.web.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MyProfileDto {
    private String userId;
    private String email;
    private String username;
    private String name;
    private String profileImage; // 새로 추가한 컬럼
    private String intro;        // 새로 추가한 컬럼
    private Double rating;       // 리뷰 평균 (없으면 null)
}