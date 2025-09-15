package com.tbc.tbc.payments.service;


import com.tbc.tbc.payments.domain.wallet.Wallet;
import com.tbc.tbc.payments.repository.WalletLedgerRepository;
import com.tbc.tbc.payments.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MonitoringService {

    private final WalletRepository walletRepo;
    private final WalletLedgerRepository ledgerRepo;

    /**
     * 모든 wallet 의 balance 와 ledger 합계가 일치하는지 검증
     */
    @Transactional(readOnly = true)
    public String checkConsistency() {
        StringBuilder sb = new StringBuilder();
        List<Wallet> wallets = walletRepo.findAll();

        for (Wallet w : wallets) {
            Long ledgerSum = ledgerRepo.sumByWalletId(w.getId());
            if (!w.getBalance().equals(ledgerSum)) {
                sb.append("❌ Wallet ID=")
                    .append(w.getId())
                    .append(" 불일치: balance=")
                    .append(w.getBalance())
                    .append(", ledgerSum=")
                    .append(ledgerSum)
                    .append("\n");
            } else {
                sb.append("✅ Wallet ID=")
                    .append(w.getId())
                    .append(" OK\n");
            }
        }
        return sb.toString();
    }
}
