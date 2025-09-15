package com.tbc.tbc.payments.service;

import com.tbc.tbc.payments.domain.wallet.Wallet;
import com.tbc.tbc.payments.repository.WalletLedgerRepository;
import com.tbc.tbc.payments.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WalletReconcileService {

    private final WalletRepository walletRepo;
    private final WalletLedgerRepository ledgerRepo;

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
