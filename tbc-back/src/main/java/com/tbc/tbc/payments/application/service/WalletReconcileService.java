package com.tbc.tbc.payments.application.service;

import com.tbc.tbc.payments.domain.wallet.Wallet;
import com.tbc.tbc.payments.application.port.out.WalletLedgerPersistencePort;
import com.tbc.tbc.payments.application.port.out.WalletPersistencePort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WalletReconcileService {

    private final WalletPersistencePort walletRepo;
    private final WalletLedgerPersistencePort ledgerRepo;

    public String reconcileAll() {
        List<Wallet> wallets = walletRepo.findAll();
        StringBuilder sb = new StringBuilder();

        for (Wallet w : wallets) {
            Long calc = ledgerRepo.sumByWalletId(w.getId());
            long expected = (calc != null) ? calc : 0L;
            long stored = w.getBalance();

            if (expected != stored) {
                sb.append("❗ walletId=").append(w.getId())
                        .append(" stored=").append(stored)
                        .append(" expected=").append(expected)
                        .append(" (diff=").append(expected - stored).append(")\n");
            }
        }
        if (sb.length() == 0) sb.append("✅ 모든 지갑 정합성 OK");
        return sb.toString();
    }
}
