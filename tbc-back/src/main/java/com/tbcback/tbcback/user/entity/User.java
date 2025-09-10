package com.tbcback.tbcback.user.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, unique=true, length=191)
    private String email;

    @Column(nullable=false)
    private String realName;

    @Column(nullable=false)
    private String password;

    @Column(nullable=false, unique=true, length=50)
    private String nickname;

    protected User() {}

    public static User of(String email, String realName, String encodedPassword, String nickname) {
        User u = new User();
        u.email = email;
        u.realName = realName;
        u.password = encodedPassword;
        u.nickname = nickname;
        return u;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getRealName() { return realName; }
    public String getPassword() { return password; }
    public String getNickname() { return nickname; }
}
