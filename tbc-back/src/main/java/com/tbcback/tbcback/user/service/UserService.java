package com.tbcback.tbcback.user.service;

import com.tbcback.tbcback.user.dto.SignupRequest;
import com.tbcback.tbcback.user.entity.User;
import com.tbcback.tbcback.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 회원가입
    @Transactional
    public User signup(SignupRequest signupRequest) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new IllegalArgumentException("email duplicated");
        }
        if (userRepository.existsByPhone(signupRequest.getPhone())) {
            throw new IllegalArgumentException("phone duplicated");
        }
        if (userRepository.findByUsername(signupRequest.getUsername()).isPresent()) {
            throw new IllegalArgumentException("username duplicated");
        }

        User user = User.builder()
                .email(signupRequest.getEmail())
                .phone(signupRequest.getPhone())
                .username(signupRequest.getUsername())
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .nickname(signupRequest.getNickname())
                .build();

        return userRepository.save(user);
    }

    // username으로 유저 조회 (없으면 null)
    @Transactional(readOnly = true)
    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    // email 또는 phone 으로 username 찾기 (없으면 null)
    @Transactional(readOnly = true)
    public String findUsernameByEmailOrPhone(String emailOrPhone) {
        return userRepository.findByEmail(emailOrPhone).map(User::getUsername)
                .orElseGet(() -> userRepository.findByPhone(emailOrPhone).map(User::getUsername).orElse(null));
    }

    // 비밀번호 초기화: 임시 비밀번호 생성 → 해시 저장 후 원문 반환
    @Transactional
    public String resetPassword(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("user not found: " + username));

        String temporaryPassword = RandomStringUtils.randomAlphanumeric(10);
        user.setPassword(passwordEncoder.encode(temporaryPassword));
        userRepository.save(user);

        return temporaryPassword;
    }

    // 중복체크
    @Transactional(readOnly = true)
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }

    @Transactional(readOnly = true)
    public boolean isPhoneAvailable(String phone) {
        return !userRepository.existsByPhone(phone);
    }

    @Transactional(readOnly = true)
    public boolean isUsernameAvailable(String username) {
        return !userRepository.existsByUsername(username);
    }
}
