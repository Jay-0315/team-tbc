package com.tbc.payments.application.service;

<<<<<<< HEAD
import com.tbc.payments.application.port.out.WalletRepositoryPort;
import com.tbc.payments.domain.model.Wallet;
=======
import com.tbc.payments.domain.wallet.Wallet;
import com.tbc.payments.application.port.in.WalletUseCase;
import com.tbc.payments.application.port.out.WalletPersistencePort;
>>>>>>> origin/dev
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
<<<<<<< HEAD
public class WalletService {
    private final WalletRepositoryPort walletRepo;

    @Transactional(readOnly = true)
    public long getBalance(Long userId) {
        return walletRepo.findByUserId(userId).map(Wallet::balance).orElse(0L);
    }

    @Transactional
    public void charge(Long userId, long amount) {
        if (amount <= 0) throw new IllegalArgumentException("amount must be positive");
        walletRepo.updateBalance(userId, amount);
    }

    @Transactional
    public void debit(Long userId, long amount) {
        if (amount <= 0) throw new IllegalArgumentException("amount must be positive");
        long bal = getBalance(userId);
        if (bal < amount) throw new IllegalStateException("INSUFFICIENT_BALANCE");
        walletRepo.updateBalance(userId, -amount);
    }
}



=======
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
>>>>>>> origin/dev
