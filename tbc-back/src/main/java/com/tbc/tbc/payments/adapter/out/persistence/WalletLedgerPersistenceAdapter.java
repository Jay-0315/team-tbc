package com.tbc.tbc.payments.adapter.out.persistence;

import com.tbc.tbc.payments.application.port.out.WalletLedgerPersistencePort;
import com.tbc.tbc.payments.domain.wallet.WalletLedger;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class WalletLedgerPersistenceAdapter implements WalletLedgerPersistencePort {

    private final WalletLedgerRepository walletLedgerRepository;

    @Override
    public WalletLedger saveLedger(WalletLedger ledger) {
        return walletLedgerRepository.save(ledger);
    }

    @Override
    public Optional<WalletLedger> findByIdempotencyKey(String idempotencyKey) {
        return walletLedgerRepository.findByIdempotencyKey(idempotencyKey);
    }

    @Override
    public Long sumByWalletId(Long walletId) {
        return walletLedgerRepository.sumByWalletId(walletId);
    }
}