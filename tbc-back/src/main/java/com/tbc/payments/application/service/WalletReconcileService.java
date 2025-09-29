package com.tbc.payments.application.service;

import com.tbc.payments.domain.wallet.Wallet;
import com.tbc.payments.application.port.out.WalletLedgerPersistencePort;
import com.tbc.payments.application.port.out.WalletPersistencePort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WalletReconcileService {

    private final WalletPersistencePort walletRepository;
    private final WalletLedgerPersistencePort ledgerRepository;

    public String reconcileAll() {
        List<Wallet> wallets = walletRepository.findAll();
        StringBuilder sb = new StringBuilder();

        for (Wallet w : wallets) {
            Long calc = ledgerRepository.sumByWalletId(w.getId());
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

    @org.springframework.transaction.annotation.Transactional // 수정 트랜잭션
    public String reconcileAllAndFix() {
        var wallets = walletRepository.findAll();
        StringBuilder sb = new StringBuilder();

        for (var w : wallets) {
            Long sum = ledgerRepository.sumByWalletId(w.getId());
            long expected = (sum != null) ? sum : 0L;
            long stored = w.getBalance();

            if (expected != stored) {
                sb.append("❗ walletId=").append(w.getId())
                        .append(" stored=").append(stored)
                        .append(" expected=").append(expected)
                        .append(" (fix)\n");

                w.setBalance(expected);              // 보정
                walletRepository.saveWallet(w);      // 저장
            } else {
                sb.append("✅ walletId=").append(w.getId()).append(" OK\n");
            }
        }
        return sb.toString();
    }
}