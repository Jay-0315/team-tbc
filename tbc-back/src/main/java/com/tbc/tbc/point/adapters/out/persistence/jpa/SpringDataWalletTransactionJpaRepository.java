package com.tbc.tbc.adapters.out.persistence.jpa;

import com.tbc.tbc.point.adapters.out.persistence.entity.WalletTransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataWalletTransactionJpaRepository extends JpaRepository<WalletTransactionEntity, Long> { } // String → Long
