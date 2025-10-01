package com.tbc.payments.application.service;

import com.tbc.payments.adapter.in.web.dto.SettlementRequest;
import com.tbc.payments.adapter.in.web.dto.SettlementResponse;
import com.tbc.payments.application.port.out.WalletLedgerPersistencePort;
import com.tbc.payments.application.port.out.WalletPersistencePort;
import com.tbc.payments.domain.wallet.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SettlementService {

    private final WalletPersistencePort walletRepo;
    private final WalletLedgerPersistencePort ledgerRepo;

    private static final Long PLATFORM_USER_ID = 0L; // 플랫폼 전용 wallet

    @Transactional
    public SettlementResponse close(SettlementRequest req) {
        // 1) 플랫폼 지갑 조회 (for update)
        Wallet platform = walletRepo.findByUserIdForUpdate(PLATFORM_USER_ID)
                .orElseThrow(() -> new IllegalStateException("PLATFORM_WALLET_NOT_FOUND"));

        if (platform.getBalance() < req.totalAmount()) {
            throw new IllegalStateException("PLATFORM_BALANCE_NOT_ENOUGH");
        }

        // 2) 호스트 지갑 조회 (for update)
        Wallet host = walletRepo.findByUserIdForUpdate(req.hostId())
                .orElseThrow(() -> new IllegalStateException("HOST_WALLET_NOT_FOUND"));

        // 3) 원장 기록: 플랫폼 DEBIT, 호스트 CREDIT
        String idemKeyPlatform = "SETTLEMENT:DEBIT:" + req.meetingId();
        String idemKeyHost = "SETTLEMENT:CREDIT:" + req.meetingId();

        if (ledgerRepo.findByIdempotencyKey(idemKeyPlatform).isEmpty()) {
            WalletLedger debit = WalletLedger.builder()
                    .walletId(platform.getId())
                    .type(LedgerType.DEBIT)
                    .amount(req.totalAmount())
                    .reason("SETTLEMENT")
                    .refType("MEETING")
                    .refId(String.valueOf(req.meetingId()))
                    .idempotencyKey(idemKeyPlatform)
                    .build();
            ledgerRepo.saveLedger(debit);

            platform.setBalance(platform.getBalance() - req.totalAmount());
            walletRepo.saveWallet(platform);
        }

        if (ledgerRepo.findByIdempotencyKey(idemKeyHost).isEmpty()) {
            WalletLedger credit = WalletLedger.builder()
                    .walletId(host.getId())
                    .type(LedgerType.CREDIT)
                    .amount(req.totalAmount())
                    .reason("SETTLEMENT")
                    .refType("MEETING")
                    .refId(String.valueOf(req.meetingId()))
                    .idempotencyKey(idemKeyHost)
                    .build();
            ledgerRepo.saveLedger(credit);

            host.setBalance(host.getBalance() + req.totalAmount());
            walletRepo.saveWallet(host);
        }

        return new SettlementResponse(
                req.meetingId(),
                req.hostId(),
                req.totalAmount(),
                host.getBalance(),
                platform.getBalance()
        );
    }
}