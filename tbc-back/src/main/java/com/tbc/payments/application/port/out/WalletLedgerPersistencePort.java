package com.tbc.payments.application.port.out;

import com.tbc.payments.domain.wallet.WalletLedger;

import java.util.Optional;

public interface WalletLedgerPersistencePort {
    WalletLedger saveLedger(WalletLedger ledger);
    Optional<WalletLedger> findByIdempotencyKey(String idempotencyKey);
    Long sumByWalletId(Long walletId);
}
