package com.tbc.payments.application.port.in;

import com.tbc.payments.domain.wallet.Wallet;

public interface WalletUseCase {
    Wallet getOrCreate(Long userId);
}