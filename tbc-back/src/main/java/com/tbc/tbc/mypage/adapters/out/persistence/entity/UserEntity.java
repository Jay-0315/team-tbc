package com.tbc.tbc.mypage.adapters.out.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "users")
@Getter
@Setter
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // BIGINT AUTO_INCREMENT
    @Column(name = "id")
    private Long id;   // BIGINT

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email; // 로그인 이메일

    @Column(name = "username", nullable = false, unique = true, length = 100)
    private String username; // 닉네임/아이디

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash; // 비밀번호 해시

    @Column(name = "name", length = 100)
    private String name; // 실명(선택)

    @Column(name = "created_at")
    private Instant createdAt; // 가입일시

    @Column(name = "profile_image")
    private String profileImage;

    @Column(name = "intro")
    private String intro;

    // --- 추가 필드 ---
    @Column(name = "phone", length = 20, unique = true)
    private String phone;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    public enum Gender { F, M }

    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    private Gender gender;
}
