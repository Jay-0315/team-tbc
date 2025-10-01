package com.tbc.login.adapter.in.controller;

import com.tbc.login.domain.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        return ResponseEntity.ok(userService.isEmailAvailable(email));
    }

    @GetMapping("/check-nickname")
    public ResponseEntity<?> checkNickname(@RequestParam String nickname, Authentication auth) {
        Long currentUserId = null;
        if (auth != null && auth.isAuthenticated()) {
            try {
                currentUserId = Long.parseLong(auth.getName());
            } catch (NumberFormatException e) {
                // 인증되지 않았거나 ID 파싱 실패 시 null 유지
            }
        }
        return ResponseEntity.ok(userService.isNicknameAvailable(nickname, currentUserId));
    }
}
