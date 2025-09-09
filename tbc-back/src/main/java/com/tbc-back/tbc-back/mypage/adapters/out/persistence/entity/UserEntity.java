package com.tbc_back.tbc_back.adapters.out.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
public class UserEntity {

    @Id
    @Column(name = "id", columnDefinition = "CHAR(36)")
    private String id;   // uuid [pk]

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
}
