package com.tbc.tbc.payments.application.port.in;

import com.tbc.tbc.payments.domain.wallet.Wallet;

public interface WalletUseCase {
    Wallet getOrCreate(Long userId);
}