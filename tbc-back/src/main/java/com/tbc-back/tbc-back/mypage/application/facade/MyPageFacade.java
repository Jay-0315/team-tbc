package com.tbc_back.tbc_back.mypage.application.facade;

import com.tbc_back.tbc_back.adapters.out.persistence.entity.*;
import com.tbc_back.tbc_back.mypage.adapters.in.web.dto.*;
import com.tbc_back.tbc_back.mypage.adapters.out.persistence.jpa.*;
import com.tbc_back.tbc_back.adapters.out.persistence.entity.MeetupEntity;
import com.tbc_back.tbc_back.adapters.out.persistence.jpa.SpringDataMeetupJpaRepository;
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
    private final SpringDataMeetupJpaRepository meetupRepo;

    // 1) 프로필
    public MyProfileDto getProfile(String userId) {
        UserEntity u = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        return MyProfileDto.builder()
                .userId(u.getId())
                .email(u.getEmail())
                .username(u.getUsername())
                .name(u.getName())
                .profileImage(u.getProfileImage()) // 추가
                .intro(u.getIntro())               // 추가
                // .rating(평균값) // 평점은 나중에 userRepo에 평균 쿼리 추가한 뒤 세팅
                .build();
    }

    public MyProfileDto updateProfile(String userId, UpdateProfileRequest req) {
        UserEntity u = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if (req.getName() != null) u.setName(req.getName());
        if (req.getIntro() != null) u.setIntro(req.getIntro());
        if (req.getProfileImage() != null) u.setProfileImage(req.getProfileImage());

        userRepo.save(u);

        return MyProfileDto.builder()
                .userId(u.getId())
                .email(u.getEmail())
                .username(u.getUsername())
                .name(u.getName())
                .profileImage(u.getProfileImage())
                .intro(u.getIntro())
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
        ).collect(java.util.stream.Collectors.toList());

        return PagedResponse.<WalletTxnDto>builder()
                .content(content)
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .build();
    }

    // 4) 내가 참가한 모임
    public PagedResponse<MyMeetupItemDto> getMyMeetups(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MeetupParticipantEntity> p = participantRepo.findByIdUserIdOrderByJoinedAtDesc(userId, pageable);

        List<MyMeetupItemDto> content = p.getContent().stream()
                .map((MeetupParticipantEntity mp) -> MyMeetupItemDto.builder()
                        .meetupId(mp.getMeetup().getId())
                        .title(mp.getMeetup().getTitle())
                        .startAt(mp.getMeetup().getStartAt())
                        .endAt(mp.getMeetup().getEndAt())
                        .role(mp.getRole())                          // String 그대로
                        .participantStatus(mp.getStatus())           // 참가 상태
                        .joinedAt(mp.getJoinedAt())
                        .meetupStatus(mp.getMeetup().getStatus())    // 모임 상태
                        .participantCount(mp.getMeetup().getParticipants().size())
                        .pricePoints(mp.getMeetup().getPricePoints())
                        .build()
                )
                .collect(java.util.stream.Collectors.toList());

        return PagedResponse.<MyMeetupItemDto>builder()
                .content(content)
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .build();
    }

    // 5) 내가 진행한 모임
    public PagedResponse<MyMeetupItemDto> getHostedMeetups(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MeetupEntity> p = meetupRepo.findByHostIdOrderByStartAtDesc(userId, pageable);

        List<MyMeetupItemDto> content = p.getContent().stream()
                .map((MeetupEntity m) -> MyMeetupItemDto.builder()
                        .meetupId(m.getId())
                        .title(m.getTitle())
                        .startAt(m.getStartAt())
                        .endAt(m.getEndAt())
                        .role("HOST")
                        .participantStatus(null)
                        .joinedAt(null)
                        .meetupStatus(m.getStatus())                // String 그대로
                        .participantCount(m.getParticipants().size())
                        .pricePoints(m.getPricePoints())
                        .build()
                )
                .collect(java.util.stream.Collectors.toList());

        return PagedResponse.<MyMeetupItemDto>builder()
                .content(content)
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .build();
    }
}
