package com.tbc.tbc.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tbcback.tbcback.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * /api/users/signup 통합 테스트 (실제 MySQL 사용)
 * Security 필터는 비활성(addFilters=false)로 단순히 API만 검증
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class UserControllerSignupTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper om;
    @Autowired UserRepository userRepository;

    @BeforeEach
    void setup() {
        userRepository.deleteAll(); // 테스트마다 깨끗하게
    }

    @Test
    @DisplayName("회원가입 성공 시 DB에 유저가 저장된다")
    void signup_success_persistsUser() throws Exception {
        var req = new SignupReq("a@a.com","01012341234","ash","1234!abcd","상현");
        var json = om.writeValueAsString(req);

        mockMvc.perform(post("/api/users/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk());

        assertThat(userRepository.findByEmail("a@a.com")).isPresent();
    }

    // 테스트용 요청 DTO (컨트롤러의 SignupRequest와 동일 필드)
    record SignupReq(String email, String phone, String username, String password, String nickname) {}
}
