package com.tbc.tbc.payments.repository;

import com.tbc.tbc.payments.domain.wallet.WalletLedger;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletLedgerRepository extends JpaRepository<WalletLedger, Long> { }
