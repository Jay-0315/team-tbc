package com.tbc.tbc.mypage.adapters.in.web;

import com.tbc.tbc.mypage.application.facade.MyPageFacade;
import com.tbc.tbc.mypage.adapters.in.web.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class MyPageController {

    private final MyPageFacade facade;

    // 프로필 조회
    @GetMapping("/profile")
    public ResponseEntity<MyProfileDto> profile(@RequestParam Long userId) {
        return ResponseEntity.ok(facade.getProfile(userId));
    }

    // 프로필 수정
    @PutMapping("/profile")
    public ResponseEntity<MyProfileDto> updateProfile(@RequestParam Long userId,
                                                      @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(facade.updateProfile(userId, req));
    }

    // 프로필 이미지 업로드(개발 편의용): 파일 저장 후 URL 반환
    @PostMapping(value = "/profile/image", consumes = {"multipart/form-data"})
    public ResponseEntity<String> uploadProfileImage(@RequestParam("file") MultipartFile file) throws Exception {
        // 절대 경로 기반으로 저장 (user.dir/uploads/profile)
        java.nio.file.Path dir = java.nio.file.Paths.get(System.getProperty("user.dir"), "uploads", "profile");
        java.nio.file.Files.createDirectories(dir);

        String safeName = file.getOriginalFilename() == null ? "image" : file.getOriginalFilename();
        String filename = java.time.LocalDateTime.now().toString().replace(":","-") + "-" + safeName;
        java.nio.file.Path path = dir.resolve(filename).toAbsolutePath();

        // Part.write는 컨테이너 경로 기준이므로 직접 복사해 저장
        try (java.io.InputStream in = file.getInputStream()) {
            java.nio.file.Files.copy(in, path, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        }

        String url = "/uploads/profile/" + filename;
        return ResponseEntity.ok(url);
    }

    // 지갑 요약
    @GetMapping("/wallet")
    public ResponseEntity<WalletSummaryDto> wallet(@RequestParam Long userId) {
        return ResponseEntity.ok(facade.getWalletSummary(userId));
    }

    // 거래내역
    @GetMapping("/wallet/txns")
    public ResponseEntity<PagedResponse<WalletTxnDto>> walletTxns(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(facade.getWalletTxns(userId, page, size));
    }

    // 내가 참가한 모임
    @GetMapping("/meetups")
    public ResponseEntity<PagedResponse<MyMeetupItemDto>> myMeetups(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(facade.getMyMeetups(userId, page, size));
    }

    // 내가 진행한 모임
    @GetMapping("/hosted-meetups")
    public ResponseEntity<PagedResponse<MyMeetupItemDto>> hostedMeetups(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(facade.getHostedMeetups(userId, page, size));
    }

    // 🔥 열린 모임
    @GetMapping("/open-meetups")
    public ResponseEntity<List<MyMeetupItemDto>> openMeetups() {
        return ResponseEntity.ok(facade.getOpenMeetups());
    }

    // 참여 중인 모임
    @GetMapping("/my-meetups/active")
    public ResponseEntity<PagedResponse<MyMeetupItemDto>> myActiveMeetups(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(facade.getActiveMeetups(userId, page, size));
    }

    // 참여 종료된 모임
    @GetMapping("/my-meetups/ended")
    public ResponseEntity<PagedResponse<MyMeetupItemDto>> myEndedMeetups(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(facade.getEndedMeetups(userId, page, size));
    }
}

