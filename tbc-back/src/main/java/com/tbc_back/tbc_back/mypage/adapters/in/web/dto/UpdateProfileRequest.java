package com.tbc_back.tbc_back.mypage.adapters.in.web.dto;

import lombok.*;

// 수정 요청용
@Getter @Setter
public class UpdateProfileRequest {
    private String username;
    private String name;         // 선택 수정
    private String profileImage; // URL 업로드 후 세팅
    private String intro;        // 한줄소개
}