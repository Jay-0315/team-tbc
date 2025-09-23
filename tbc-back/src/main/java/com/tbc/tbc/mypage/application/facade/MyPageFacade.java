package com.tbc.tbc.mypage.application.facade;

import com.tbc.tbc.mypage.adapters.out.persistence.entity.UserEntity;
import com.tbc.tbc.mypage.adapters.in.web.dto.*;
import com.tbc.tbc.mypage.adapters.out.persistence.jpa.*;
import com.tbc.tbc.point.adapters.out.persistence.entity.MeetupEntity;
import com.tbc.tbc.point.adapters.out.persistence.entity.MeetupParticipantEntity;
import com.tbc.tbc.point.adapters.out.persistence.jpa.SpringDataMeetupJpaRepository;
import com.tbc.tbc.payments.domain.wallet.Wallet;
import com.tbc.tbc.payments.domain.wallet.WalletLedger;
import lombok.RequiredArgsConstructor;
import java.time.ZoneId;
import java.util.stream.Collectors;
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
    public MyProfileDto getProfile(Long userId) {
        UserEntity u = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        return MyProfileDto.builder()
                .userId(u.getId())
                .email(u.getEmail())
                .username(u.getUsername())
                .name(u.getName())
                .profileImage(u.getProfileImage())
                .intro(u.getIntro())
                .phone(u.getPhone())
                .birthDate(u.getBirthDate())
                .gender(u.getGender())
                .build();
    }

    public MyProfileDto updateProfile(Long userId, UpdateProfileRequest req) {
        UserEntity u = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // 닉네임(username) 수정 추가 ✅
        if (req.getUsername() != null && !req.getUsername().isBlank()) {
            u.setUsername(req.getUsername());
        }

        if (req.getName() != null && !req.getName().isBlank()) {
            u.setName(req.getName());
        }

        if (req.getIntro() != null) {
            u.setIntro(req.getIntro());
        }

        if (req.getProfileImage() != null) {
            u.setProfileImage(req.getProfileImage());
        }

        if (req.getPhone() != null) {
            u.setPhone(req.getPhone());
        }
        if (req.getBirthDate() != null) {
            u.setBirthDate(req.getBirthDate());
        }
        if (req.getGender() != null) {
            u.setGender(req.getGender());
        }

        userRepo.save(u);

        return MyProfileDto.builder()
                .userId(u.getId())
                .email(u.getEmail())
                .username(u.getUsername())   // ✅ 변경된 닉네임 반환
                .name(u.getName())
                .profileImage(u.getProfileImage())
                .intro(u.getIntro())
                .phone(u.getPhone())
                .birthDate(u.getBirthDate())
                .gender(u.getGender())
                .build();
    }


    // 2) 지갑 요약
    public WalletSummaryDto getWalletSummary(Long userId) {
        Wallet w = walletRepo.findByUserId(userId)
                .orElseGet(() -> walletRepo.save(Wallet.builder()
                        .userId(userId)
                        .balance(0L)
                        .build()));

        return WalletSummaryDto.builder()
                .walletId(w.getId())
                .balancePoints(w.getBalance()) // ✅ balance 사용
                .build();
    }

    // 3) 거래내역 (페이징)
    public PagedResponse<WalletTxnDto> getWalletTxns(Long userId, int page, int size) {
        Wallet w = walletRepo.findByUserId(userId)
                .orElseGet(() -> walletRepo.save(Wallet.builder()
                        .userId(userId)
                        .balance(0L)
                        .build()));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<WalletLedger> p = txnRepo.findByWalletIdOrderByCreatedAtDesc(w.getId(), pageable);

        List<WalletTxnDto> content = p.getContent().stream()
                .map(tx -> WalletTxnDto.builder()
                        .id(tx.getId())
                        .type(tx.getType().name())
                        .status(tx.getReason())
                        .amountPoints(tx.getAmount())
                        .meetupId(tx.getRefId())
                        .externalRef(tx.getIdempotencyKey())
                        .description(tx.getReason())
                        .createdAt(tx.getCreatedAt().atZone(ZoneId.systemDefault()).toInstant())
                        .build()
                )
                .collect(Collectors.toList());

        return PagedResponse.<WalletTxnDto>builder()
                .content(content)
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .build();
    }


    // 4) 내가 참가한 모임
    public PagedResponse<MyMeetupItemDto> getMyMeetups(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MeetupParticipantEntity> p = participantRepo.findByUserIdOrderByJoinedAtDesc(userId, pageable);

        List<MyMeetupItemDto> content = p.getContent().stream()
                .map((MeetupParticipantEntity mp) -> MyMeetupItemDto.builder()
                        .meetupId(mp.getMeetup().getId())
                        .title(mp.getMeetup().getTitle())
                        .startAt(mp.getMeetup().getStartAt())
                        .endAt(mp.getMeetup().getEndAt())
                        .role(mp.getRole())
                        .participantStatus(mp.getStatus())
                        .joinedAt(mp.getJoinedAt())
                        .meetupStatus(mp.getMeetup().getStatus())
                        .participantCount(mp.getMeetup().getParticipants().size())
                        .pricePoints(mp.getMeetup().getPricePoints())
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

    // 5) 내가 진행한 모임
    public PagedResponse<MyMeetupItemDto> getHostedMeetups(Long userId, int page, int size) {
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
                        .meetupStatus(m.getStatus())
                        .participantCount(m.getParticipants().size())
                        .pricePoints(m.getPricePoints())
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

    // 🔥 열린 모임
    public List<MyMeetupItemDto> getOpenMeetups() {
        return meetupRepo.findByStatus("OPEN").stream()
                .map(m -> MyMeetupItemDto.builder()
                        .meetupId(m.getId())
                        .title(m.getTitle())
                        .startAt(m.getStartAt())
                        .endAt(m.getEndAt())
                        .role("GUEST")
                        .participantStatus(null)
                        .joinedAt(null)
                        .meetupStatus(m.getStatus())
                        .participantCount(m.getParticipants().size())
                        .pricePoints(m.getPricePoints())
                        .build()
                ).toList();
    }

    // 참여 중인 모임
    public PagedResponse<MyMeetupItemDto> getActiveMeetups(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MeetupParticipantEntity> p = participantRepo.findActiveByUser(userId, pageable);
        List<MyMeetupItemDto> content = p.getContent().stream()
                .map((MeetupParticipantEntity mp) -> MyMeetupItemDto.builder()
                        .meetupId(mp.getMeetup().getId())
                        .title(mp.getMeetup().getTitle())
                        .startAt(mp.getMeetup().getStartAt())
                        .endAt(mp.getMeetup().getEndAt())
                        .role(mp.getRole())
                        .participantStatus(mp.getStatus())
                        .joinedAt(mp.getJoinedAt())
                        .meetupStatus(mp.getMeetup().getStatus())
                        .participantCount(mp.getMeetup().getParticipants().size())
                        .pricePoints(mp.getMeetup().getPricePoints())
                        .build()).toList();

        return PagedResponse.<MyMeetupItemDto>builder()
                .content(content)
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .build();
    }

    // 참여 종료된 모임
    public PagedResponse<MyMeetupItemDto> getEndedMeetups(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MeetupParticipantEntity> p = participantRepo.findEndedByUser(userId, pageable);
        List<MyMeetupItemDto> content = p.getContent().stream()
                .map((MeetupParticipantEntity mp) -> MyMeetupItemDto.builder()
                        .meetupId(mp.getMeetup().getId())
                        .title(mp.getMeetup().getTitle())
                        .startAt(mp.getMeetup().getStartAt())
                        .endAt(mp.getMeetup().getEndAt())
                        .role(mp.getRole())
                        .participantStatus(mp.getStatus())
                        .joinedAt(mp.getJoinedAt())
                        .meetupStatus(mp.getMeetup().getStatus())
                        .participantCount(mp.getMeetup().getParticipants().size())
                        .pricePoints(mp.getMeetup().getPricePoints())
                        .build()).toList();

        return PagedResponse.<MyMeetupItemDto>builder()
                .content(content)
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .build();
    }
}
