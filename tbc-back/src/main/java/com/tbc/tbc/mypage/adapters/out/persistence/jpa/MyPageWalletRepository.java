package com.tbc.tbc.mypage.adapters.out.persistence.jpa;

import com.tbc.tbc.payments.domain.wallet.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MyPageWalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByUserId(Long userId);
}