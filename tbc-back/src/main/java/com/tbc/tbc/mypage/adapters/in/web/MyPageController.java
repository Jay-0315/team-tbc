package com.tbc.tbc.mypage.adapters.in.web;

import com.tbc.tbc.mypage.application.facade.MyPageFacade;
import com.tbc.tbc.mypage.adapters.in.web.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}

