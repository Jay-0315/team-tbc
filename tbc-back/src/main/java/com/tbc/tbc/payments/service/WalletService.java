package com.tbc.tbc.payments.service;

import com.tbc.tbc.payments.domain.wallet.Wallet;
import com.tbc.tbc.payments.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WalletService {
    private final WalletRepository walletRepository;

    /** 사용자 지갑이 없으면 balance=0으로 생성 */
    @Transactional
    public Wallet getOrCreate(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> walletRepository.save(
                        Wallet.builder().userId(userId).balance(0L).build()
                ));
    }
}
