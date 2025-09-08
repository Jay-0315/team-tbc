package com.tbc_back.tbc_back.application.service;

import com.tbc_back.tbc_back.application.exception.InsufficientPointsException;
import com.tbc_back.tbc_back.application.port.in.DeductPointUseCase;
import com.tbc_back.tbc_back.domain.model.Wallet;
import com.tbc_back.tbc_back.domain.model.WalletTransaction;
import com.tbc_back.tbc_back.domain.repository.WalletRepository;
import com.tbc_back.tbc_back.domain.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeductPointService implements DeductPointUseCase {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    @Override
    @Transactional
    public void deduct(String userId, String meetupId, long amountPoints, String externalRef, String description) {
        if (amountPoints <= 0) throw new IllegalArgumentException("amountPoints must be positive");

        Wallet wallet = walletRepository.findByOwnerUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user: " + userId));

        boolean ok = walletRepository.atomicDeduct(wallet.getId(), amountPoints);
        if (!ok) throw new InsufficientPointsException("INSUFFICIENT_POINTS");

        WalletTransaction tx = new WalletTransaction(
                UUID.randomUUID().toString(),
                wallet.getId(),
                WalletTransaction.Type.DEBIT,
                WalletTransaction.Status.SUCCESS,
                amountPoints,
                meetupId,
                null,                 // counterpartyWalletId (없음)
                externalRef,          // 멱등/추적용
                description,          // "MEETUP_JOIN" 등
                Instant.now(),
                Instant.now()         // settledAt: 차감 즉시 성공 처리
        );
        walletTransactionRepository.save(tx);
    }
}
