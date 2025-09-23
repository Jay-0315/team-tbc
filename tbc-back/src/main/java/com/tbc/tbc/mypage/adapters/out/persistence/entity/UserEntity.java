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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    // 팀 스키마: nickname
    @Column(name = "nickname", nullable = false, unique = true, length = 255)
    private String nickname;

    // 팀 스키마: password (plain 컬럼명)
    @Column(name = "password", nullable = false, length = 255)
    private String password;

    // 팀 스키마: real_name
    @Column(name = "real_name", length = 255)
    private String realName;
}
