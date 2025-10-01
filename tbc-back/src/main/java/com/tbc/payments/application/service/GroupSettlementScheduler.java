package com.tbc.payments.application.service;

import com.tbc.group.adapterout.persistence.jpa.entity.GroupEntity;
import com.tbc.group.adapterout.persistence.jpa.repository.GroupJpaRepository;
import com.tbc.group.adapterout.persistence.jpa.repository.GroupMemberJpaRepository;
import com.tbc.payments.application.port.out.WalletHoldRepositoryPort;
import com.tbc.payments.application.port.out.WalletLedgerPersistencePort;
import com.tbc.payments.application.port.out.WalletPersistencePort;
import com.tbc.payments.domain.model.WalletHold;
import com.tbc.payments.domain.wallet.LedgerType;
import com.tbc.payments.domain.wallet.Wallet;
import com.tbc.payments.domain.wallet.WalletLedger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class GroupSettlementScheduler {

    private final GroupJpaRepository groupRepo;
    private final GroupMemberJpaRepository memberRepo;
    private final WalletHoldRepositoryPort holdRepo;
    private final WalletPersistencePort walletRepo;
    private final WalletLedgerPersistencePort ledgerRepo;

    // 매 1분마다 확인
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void run() {
        LocalDateTime now = LocalDateTime.now();
        List<GroupEntity> due = groupRepo.findAll().stream()
                .filter(g -> g.getStartAt() != null && !g.getStartAt().isAfter(now))
                .filter(g -> "PAID".equalsIgnoreCase(g.getFeeType()))
                .toList();
        for (GroupEntity g : due) {
            try {
                settleOrCleanupHolds(g);
            } catch (Exception e) {
                log.error("Settlement failed for group {}: {}", g.getId(), e.getMessage());
            }
        }
    }

    private void settleOrCleanupHolds(GroupEntity g) {
        // If already finalized, just cleanup residual holds deterministically
        if ("SETTLED".equalsIgnoreCase(g.getSettlementStatus())) {
            // Ensure all holds are CAPTURED then RELEASED (no ledger changes here)
            holdRepo.captureByGroupId(g.getId());
            holdRepo.releaseByGroupId(g.getId());
            return;
        }
        if ("REFUNDED".equalsIgnoreCase(g.getSettlementStatus())) {
            // Ensure any remaining HELD are refunded (idempotent) then RELEASED
            List<WalletHold> holds = holdRepo.findActiveByGroupId(g.getId());
            for (WalletHold h : holds) {
                Wallet wallet = walletRepo.findByUserIdForUpdate(h.userId())
                        .orElseGet(() -> walletRepo.saveWallet(Wallet.builder().userId(h.userId()).balance(0L).build()));

                String idemKey = "MEETUP_REFUND:CREDIT:" + g.getId() + ":" + h.userId();
                if (ledgerRepo.findByIdempotencyKey(idemKey).isEmpty()) {
                    WalletLedger credit = WalletLedger.builder()
                            .walletId(wallet.getId())
                            .type(LedgerType.CREDIT)
                            .amount(h.amount())
                            .reason("MEETUP_REFUND")
                            .refType("MEETUP")
                            .refId(String.valueOf(g.getId()))
                            .idempotencyKey(idemKey)
                            .build();
                    ledgerRepo.saveLedger(credit);

                    wallet.setBalance(wallet.getBalance() + h.amount());
                    walletRepo.saveWallet(wallet);
                }
            }
            holdRepo.releaseByGroupId(g.getId());
            return;
        }

        int joined = memberRepo.countByGroupIdAndStatus(g.getId(), "ACTIVE");
        int min = g.getMinParticipants();
        int amountPopcorn = g.getFeeAmount() == null ? 0 : g.getFeeAmount();
        final long POPCORN_TO_WON = 100L;
        long amountWon = (long) amountPopcorn * POPCORN_TO_WON;
        if (amountWon <= 0) return;

        if (joined >= min) {
            // Capture: 참가자 hold CAPTURE 후 RELEASE 처리. 호스트로 CREDIT.
            holdRepo.captureByGroupId(g.getId());

            Wallet host = walletRepo.findByUserIdForUpdate(g.getHostId())
                    .orElseThrow(() -> new IllegalStateException("HOST_WALLET_NOT_FOUND"));

            long total = amountWon * joined;
            String idemKey = "SETTLEMENT:CREDIT:" + g.getId();
            if (ledgerRepo.findByIdempotencyKey(idemKey).isEmpty()) {
                WalletLedger credit = WalletLedger.builder()
                        .walletId(host.getId())
                        .type(LedgerType.CREDIT)
                        .amount(total)
                        .reason("SETTLEMENT")
                        .refType("MEETUP")
                        .refId(String.valueOf(g.getId()))
                        .idempotencyKey(idemKey)
                        .build();
                ledgerRepo.saveLedger(credit);
                host.setBalance(host.getBalance() + total);
                walletRepo.saveWallet(host);
            }
            // RELEASE any remaining holds post-capture for cleanliness
            holdRepo.releaseByGroupId(g.getId());
            // persist settlement status
            g.setSettlementStatus("SETTLED");
            g.setSettledAt(LocalDateTime.now());
            groupRepo.save(g);
        } else {
            // 미충족: 참가자 환불 CREDIT(멱등) + HOLD RELEASE
            List<WalletHold> holds = holdRepo.findActiveByGroupId(g.getId());
            for (WalletHold h : holds) {
                // 지갑 보장(for update)
                Wallet wallet = walletRepo.findByUserIdForUpdate(h.userId())
                        .orElseGet(() -> walletRepo.saveWallet(Wallet.builder().userId(h.userId()).balance(0L).build()));

                String idemKey = "MEETUP_REFUND:CREDIT:" + g.getId() + ":" + h.userId();
                if (ledgerRepo.findByIdempotencyKey(idemKey).isEmpty()) {
                    WalletLedger credit = WalletLedger.builder()
                            .walletId(wallet.getId())
                            .type(LedgerType.CREDIT)
                .amount(h.amount())
                            .reason("MEETUP_REFUND")
                            .refType("MEETUP")
                            .refId(String.valueOf(g.getId()))
                            .idempotencyKey(idemKey)
                            .build();
                    ledgerRepo.saveLedger(credit);

                    wallet.setBalance(wallet.getBalance() + h.amount());
                    walletRepo.saveWallet(wallet);
                }
            }

            // 마지막에 HOLD RELEASE로 상태 반영
            holdRepo.releaseByGroupId(g.getId());
            // persist refund status
            g.setSettlementStatus("REFUNDED");
            g.setSettledAt(LocalDateTime.now());
            groupRepo.save(g);
        }
    }
}


