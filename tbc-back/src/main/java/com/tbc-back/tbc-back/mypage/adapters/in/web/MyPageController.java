package com.tbc_back.tbc_back.mypage.adapters.in.web;

import com.tbc_back.tbc_back.mypage.adapters.in.web.dto.*;
import com.tbc_back.tbc_back.mypage.application.facade.MyPageFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class MyPageController {

    private final MyPageFacade facade;

    // 프로필
    @GetMapping("/profile")
    public ResponseEntity<MyProfileDto> profile(@RequestParam String userId) {
        return ResponseEntity.ok(facade.getProfile(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<MyProfileDto> updateProfile(
            @RequestParam String userId,
            @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(facade.updateProfile(userId, request));
    }

    // 지갑 요약 (두 경로 모두 허용)
    @GetMapping({"/wallet", "/wallet/summary"})
    public ResponseEntity<WalletSummaryDto> wallet(@RequestParam String userId) {
        return ResponseEntity.ok(facade.getWalletSummary(userId));
    }

    // 거래내역
    @GetMapping("/wallet/txns")
    public ResponseEntity<PagedResponse<WalletTxnDto>> walletTxns(
            @RequestParam String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(facade.getWalletTxns(userId, page, size));
    }

    // 내가 참가한 모임
    @GetMapping("/meetups")
    public ResponseEntity<PagedResponse<MyMeetupItemDto>> myMeetups(
            @RequestParam String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseEntity.ok(facade.getMyMeetups(userId, page, size));
    }

    // 내가 진행한 모임 (호스트)
    @GetMapping("/meetups/hosted")
    public ResponseEntity<PagedResponse<MyMeetupItemDto>> hostedMeetups(
            @RequestParam String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseEntity.ok(facade.getHostedMeetups(userId, page, size));
    }
}
