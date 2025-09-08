package com.tbcback.tbcback.user.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_email", columnNames = "email"),
                @UniqueConstraint(name = "uk_user_username", columnNames = "username")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    // 기본 키
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 이메일은 필수이자 유니크
    @Column(nullable = false, unique = true)
    private String email;

    // 사용자 로그인 아이디(유니크)
    @Column(nullable = false, unique = true)
    private String username;

    // 비밀번호 해시
    @Column(nullable = false)
    private String password;

    // 닉네임
    private String nickname;

    // OAuth 연동용
    private String provider;

    // 공급자별 고유 식별자
    @Column(unique = true)
    private String providerId;
}
