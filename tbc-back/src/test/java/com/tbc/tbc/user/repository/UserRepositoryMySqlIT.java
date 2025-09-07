package com.tbc.tbc.user.repository;

import com.tbcback.tbcback.user.entity.User;
import com.tbcback.tbcback.user.repository.UserRepository; // ← 오타(respository) 경로에 맞춤
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

/** 진짜 MySQL(tbc_db)에 INSERT 되는지 확인 (내장DB 대체 금지) */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:mysql://192.168.219.70:3306/tbc_db?serverTimezone=Asia/Seoul&characterEncoding=UTF-8&useSSL=false&allowPublicKeyRetrieval=true",
        "spring.datasource.username=tbc",
        "spring.datasource.password=EjrqhR21!",
        "spring.jpa.hibernate.ddl-auto=update",
        "spring.jpa.show-sql=true",
        "spring.datasource.hikari.connection-timeout=3000"
})
class UserRepositoryMySqlIT {

    @Autowired UserRepository userRepository;

    @Test
    @DisplayName("UserRepository가 실제 MySQL에 INSERT 한다")
    void save_into_mysql() {
        String email = "it_" + System.currentTimeMillis() + "@a.com";

        User saved = userRepository.save(
                User.builder()
                        .email(email)
                        .phone("01011112222")
                        .username("tester_" + System.currentTimeMillis())
                        .password("raw")
                        .nickname("테스터")
                        .build()
        );

        assertThat(saved.getId()).isNotNull();
        assertThat(userRepository.findByEmail(email)).isPresent();
    }
}
