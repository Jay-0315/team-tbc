package com.tbcback.tbcback.user.controller;

import com.tbcback.tbcback.user.dto.SignupRequest;
import com.tbcback.tbcback.user.entity.User;
import com.tbcback.tbcback.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    //회원가입
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@Valid @RequestBody SignupRequest request) {
        User user = User.builder()
                .email(request.getEmail())
                .phone(request.getPhone())
                .username(request.getUsername())
                .password(request.getPassword())
                .nickname(request.getNickname())
                .build();

        User saved = userService.signUp(user);
        return ResponseEntity.ok(saved);
    }

    //이메일 중복체크
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEamil(@RequestParam String email) {
        return ResponseEntity.ok(userService.isEmailAvailable(email));
    }

    //전화번호 중복체크
    @GetMapping("/check-phone")
    public ResponseEntity<?> checkPhone(@RequestParam String phone) {
        return ResponseEntity.ok(userService.isPhoneAvailable(phone));
    }
}
