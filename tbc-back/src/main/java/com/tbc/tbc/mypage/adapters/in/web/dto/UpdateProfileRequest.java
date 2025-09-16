package com.tbc.tbc.mypage.adapters.in.web.dto;

import lombok.*;
import java.time.LocalDate;
import com.tbc.tbc.mypage.adapters.out.persistence.entity.UserEntity;

// 수정 요청용
@Getter @Setter
public class UpdateProfileRequest {
    private String username;
    private String name;         // 선택 수정
    private String profileImage; // URL 업로드 후 세팅
    private String intro;        // 한줄소개
    private String phone;
    private LocalDate birthDate;
    private UserEntity.Gender gender;
}