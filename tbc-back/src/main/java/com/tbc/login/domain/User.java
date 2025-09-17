package com.tbc.login.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "users")
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String realName;

    @Column(nullable = false, unique = true)
    private String nickname;

    private User(String email, String realName, String password, String nickname) {
        this.email = email;
        this.realName = realName;
        this.password = password;
        this.nickname = nickname;
    }

    public static User of(String email, String realName, String password, String nickname) {
        return new User(email, realName, password, nickname);
    }
}
