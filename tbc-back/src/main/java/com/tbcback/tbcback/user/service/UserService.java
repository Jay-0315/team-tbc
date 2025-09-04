package com.tbcback.tbcback.user.service;

import com.tbcback.tbcback.user.entity.User;
import com.tbcback.tbcback.user.respository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    //회원가입
    public User signUp(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("이미 사용중인 이메일 입니다.");
        }
        if (userRepository.existsByPhone(user.getPhone())) {
            throw new IllegalArgumentException("이미 사용중인 전화번호 입니다.");
        }
        return userRepository.save(user);
    }

    //이메일 중복체크
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }

    //전화번호 중복체크
    public boolean isPhoneAvailable(String phone) {
        return !userRepository.existsByPhone(phone);
    }
}
