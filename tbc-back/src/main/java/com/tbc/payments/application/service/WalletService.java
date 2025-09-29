package com.tbc.payments.application.service;

import com.tbc.payments.domain.wallet.Wallet;
import com.tbc.payments.application.port.in.WalletUseCase;
import com.tbc.payments.application.port.out.WalletPersistencePort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WalletService implements WalletUseCase {
    private final WalletPersistencePort walletRepository;

    /** 사용자 지갑이 없으면 balance=0으로 생성 */
    @Override
    @Transactional
    public Wallet getOrCreate(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> walletRepository.saveWallet(
                        Wallet.builder().userId(userId).balance(0L).build()
                ));
    }
}