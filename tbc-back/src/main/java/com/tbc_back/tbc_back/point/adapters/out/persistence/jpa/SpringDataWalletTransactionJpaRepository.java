package com.tbc_back.tbc_back.adapters.out.persistence.jpa;

import com.tbc_back.tbc_back.point.adapters.out.persistence.entity.WalletTransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataWalletTransactionJpaRepository extends JpaRepository<WalletTransactionEntity, Long> { } // String → Long
