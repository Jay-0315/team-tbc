// MyProfileDto.java
package com.tbc.tbc.mypage.adapters.in.web.dto;

import lombok.*;
import java.time.LocalDate;
import com.tbc.tbc.mypage.adapters.out.persistence.entity.UserEntity;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MyProfileDto {
    private Long userId;         // String → Long
    private String email;
    private String username;
    private String name;
    private String profileImage;
    private String intro;
    private Double rating;       // 리뷰 평균 (없으면 null)
    private String phone;
    private LocalDate birthDate;
    private UserEntity.Gender gender;
}
