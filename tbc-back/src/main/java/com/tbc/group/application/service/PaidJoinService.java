package com.tbc.group.application.service;

import com.tbc.group.adapterout.persistence.jpa.entity.GroupEntity;
import com.tbc.group.adapterout.persistence.jpa.repository.GroupJpaRepository;
import com.tbc.group.application.port.out.GroupMemberRepository;
import com.tbc.payments.application.port.out.WalletHoldRepositoryPort;
import com.tbc.payments.application.port.out.WalletLedgerPersistencePort;
import com.tbc.payments.application.port.out.WalletPersistencePort;
import com.tbc.payments.domain.model.WalletHold;
import com.tbc.payments.domain.wallet.LedgerType;
import com.tbc.payments.domain.wallet.Wallet;
import com.tbc.payments.domain.wallet.WalletLedger;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class PaidJoinService {

    private final GroupJpaRepository groupRepo;
    private final GroupMemberRepository memberRepo;
    private final WalletPersistencePort walletRepo;
    private final WalletLedgerPersistencePort ledgerRepo;
    private final WalletHoldRepositoryPort holdRepo;

    @Transactional
    public void joinWithWalletHold(Long groupId, Long userId) {
        System.out.println("=== PaidJoinService.joinWithWalletHold ===");
        System.out.println("GroupId: " + groupId + ", UserId: " + userId);
        
        GroupEntity group = groupRepo.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "GROUP_NOT_FOUND"));

        System.out.println("Group found: " + group.getTitle());
        System.out.println("Status: " + group.getStatus());
        System.out.println("SettlementStatus: " + group.getSettlementStatus());
        System.out.println("StartAt: " + group.getStartAt());

        // Guard: 중복 참가 체크 (최우선)
        boolean alreadyJoined = memberRepo.existsActiveMember(groupId, userId);
        System.out.println("Already joined check: " + alreadyJoined);
        if (alreadyJoined) {
            System.out.println("❌ ALREADY_JOINED");
            throw new ResponseStatusException(HttpStatus.CONFLICT, "ALREADY_JOINED");
        }

        // Guard: 종료/상태/정산 상태/정원
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        System.out.println("Current time: " + now);
        
        if (group.getStartAt() != null && !group.getStartAt().isAfter(now)) {
            System.out.println("❌ GROUP_ALREADY_STARTED: startAt=" + group.getStartAt() + ", now=" + now);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "GROUP_ALREADY_STARTED");
        }
        
        if (group.getStatus() != null && !"OPEN".equalsIgnoreCase(group.getStatus())) {
            System.out.println("❌ GROUP_NOT_OPEN: status=" + group.getStatus());
            throw new ResponseStatusException(HttpStatus.CONFLICT, "GROUP_NOT_OPEN");
        }
        
        if (group.getSettlementStatus() != null && !"PENDING".equalsIgnoreCase(group.getSettlementStatus())) {
            System.out.println("❌ GROUP_NOT_SETTLE_PENDING: settlementStatus=" + group.getSettlementStatus());
            throw new ResponseStatusException(HttpStatus.CONFLICT, "GROUP_NOT_SETTLE_PENDING");
        }
        
        int currentJoined = memberRepo.countActiveMembers(groupId);
        int capacity = group.getCapacity() == 0 ? group.getMaxParticipants() : group.getCapacity();
        System.out.println("Current joined: " + currentJoined + ", Capacity: " + capacity);
        
        if (capacity > 0 && currentJoined >= capacity) {
            System.out.println("❌ GROUP_FULL");
            throw new ResponseStatusException(HttpStatus.CONFLICT, "GROUP_FULL");
        }
        
        System.out.println("✅ All checks passed, proceeding with join...");

        boolean isPaid = "PAID".equalsIgnoreCase(group.getFeeType());
        int amountPopcorn = group.getFeeAmount() == null ? 0 : group.getFeeAmount();
        final long POPCORN_TO_WON = 100L;
        long amountWon = (long) amountPopcorn * POPCORN_TO_WON;

        if (isPaid && amountWon > 0) {
            // 1) 지갑 조회 (for update)
            Wallet wallet = walletRepo.findByUserIdForUpdate(userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, "INSUFFICIENT_BALANCE"));

            if (wallet.getBalance() < amountWon) {
                throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, "INSUFFICIENT_BALANCE");
            }

            // 2) 원장 DEBIT (멱등키: MEETUP_JOIN:DEBIT:{groupId}:{userId})
            String idemKey = "MEETUP_JOIN:DEBIT:" + groupId + ":" + userId;
            if (ledgerRepo.findByIdempotencyKey(idemKey).isEmpty()) {
                WalletLedger debit = WalletLedger.builder()
                        .walletId(wallet.getId())
                        .type(LedgerType.DEBIT)
                        .amount(amountWon)
                        .reason("MEETUP_JOIN")
                        .refType("MEETUP")
                        .refId(String.valueOf(groupId))
                        .idempotencyKey(idemKey)
                        .build();
                ledgerRepo.saveLedger(debit);

                wallet.setBalance(wallet.getBalance() - amountWon);
                walletRepo.saveWallet(wallet);
            }

            // 3) Hold 생성(HELD)
            holdRepo.save(new WalletHold(null, userId, groupId, amountWon, "HELD", null, null));
        }

        // 4) 멤버 등록
        memberRepo.addMember(groupId, userId);
    }
}


