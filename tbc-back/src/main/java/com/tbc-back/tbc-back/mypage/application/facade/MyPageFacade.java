package com.tbc_back.tbc_back.mypage.application.facade;

import com.tbc_back.tbc_back.adapters.out.persistence.entity.*;
import com.tbc_back.tbc_back.mypage.adapters.in.web.dto.*;
import com.tbc_back.tbc_back.mypage.adapters.out.persistence.jpa.*;
import com.tbc_back.tbc_back.mypage.adapters.out.persistence.jpa.projections.MyMeetupItemView;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MyPageFacade {

    private final MyPageUserRepository userRepo;
    private final MyPageWalletRepository walletRepo;
    private final MyPageWalletTxnRepository txnRepo;
    private final MyPageMeetupParticipantRepository participantRepo;

    // 1) 프로필
    public MyProfileDto getProfile(String userId) {
        UserEntity u = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        return MyProfileDto.builder()
                .userId(u.getId())
                .email(u.getEmail())
                .username(u.getUsername())
                .name(u.getName())
                .build();
    }

    // 2) 지갑 요약
    public WalletSummaryDto getWalletSummary(String userId) {
        WalletEntity w = walletRepo.findByOwnerUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user: " + userId));

        return WalletSummaryDto.builder()
                .walletId(w.getId())
                .balancePoints(w.getBalancePoints())
                .build();
    }

    // 3) 거래내역 (페이징)
    public PagedResponse<WalletTxnDto> getWalletTxns(String userId, int page, int size) {
        WalletEntity w = walletRepo.findByOwnerUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user: " + userId));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<WalletTransactionEntity> p = txnRepo.findByWalletIdOrderByCreatedAtDesc(w.getId(), pageable);

        List<WalletTxnDto> content = p.getContent().stream().map(tx ->
                WalletTxnDto.builder()
                        .id(tx.getId())
                        .type(tx.getType())
                        .status(tx.getStatus())
                        .amountPoints(tx.getAmountPoints())
                        .meetupId(tx.getMeetupId())
                        .externalRef(tx.getExternalRef())
                        .description(tx.getDescription())
                        .createdAt(tx.getCreatedAt())
                        .build()
        ).toList();

        return PagedResponse.<WalletTxnDto>builder()
                .content(content)
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .build();
    }

    // 4) 내가 참가한 모임 (페이징) — Projection 사용
    public PagedResponse<MyMeetupItemDto> getMyMeetups(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MyMeetupItemView> p = participantRepo.findByIdUserIdOrderByJoinedAtDesc(userId, pageable);

        List<MyMeetupItemDto> content = p.getContent().stream().map(v ->
                MyMeetupItemDto.builder()
                        .meetupId(v.getMeetup().getId())
                        .title(v.getMeetup().getTitle())
                        .startAt(v.getMeetup().getStartAt())
                        .role(v.getRole())
                        .status(v.getStatus())
                        .joinedAt(v.getJoinedAt())
                        .build()
        ).toList();

        return PagedResponse.<MyMeetupItemDto>builder()
                .content(content)
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .build();
    }
}
