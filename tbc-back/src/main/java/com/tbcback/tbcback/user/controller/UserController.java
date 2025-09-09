package com.tbcback.tbcback.user.controller;

import com.tbcback.tbcback.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 이메일 중복 체크
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        return ResponseEntity.ok(userService.isEmailAvailable(email));
    }

    // 아이디 중복 체크
    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        return ResponseEntity.ok(userService.isUsernameAvailable(username));
    }
}
