package com.tbc.point.application.service;

import com.tbc.point.application.exception.InsufficientPointsException;
import com.tbc.point.application.port.in.DeductPointUseCase;
import com.tbc.payments.domain.wallet.LedgerType;
import com.tbc.payments.domain.wallet.Wallet;
import com.tbc.payments.domain.wallet.WalletLedger;
import com.tbc.payments.adapter.out.persistence.WalletLedgerRepository;
import com.tbc.payments.adapter.out.persistence.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DeductPointService implements DeductPointUseCase {

    private final WalletRepository walletRepo;
    private final WalletLedgerRepository ledgerRepo;

    @Override
    @Transactional
    public void deduct(Long userId, Long meetupId, long amountPoints, String externalRef, String description) {
        if (amountPoints <= 0) {
            throw new IllegalArgumentException("amountPoints must be positive");
        }

        // 1) 사용자 지갑 조회 (for update → 동시성 제어). 없으면 0원 지갑 생성
        Wallet wallet = walletRepo.findByUserIdForUpdate(userId)
                .orElseGet(() -> walletRepo.save(Wallet.builder()
                        .userId(userId)
                        .balance(0L)
                        .build()));

        // 2) 잔액 확인
        if (wallet.getBalance() < amountPoints) {
            throw new InsufficientPointsException("INSUFFICIENT_POINTS");
        }

        // 3) Ledger 기록 (멱등 키 사용)
        String idemKey = "JOIN:" + meetupId + ":" + userId;
        if (ledgerRepo.findByIdempotencyKey(idemKey).isEmpty()) {
            WalletLedger ledger = WalletLedger.builder()
                    .walletId(wallet.getId())
                    .type(LedgerType.DEBIT)        // 차감
                    .amount(amountPoints)
                    .reason("MEETUP_JOIN")         // 참여 사유
                    .refType("MEETUP")
                    .refId(String.valueOf(meetupId))
                    .idempotencyKey(idemKey)
                    .build();
            ledgerRepo.save(ledger);

            // 4) Wallet 잔액 차감
            wallet.setBalance(wallet.getBalance() - amountPoints);
            walletRepo.save(wallet);
        }
    }
}
