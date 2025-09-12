package com.tbc_back.tbc_back.domain.repository;

import com.tbc_back.tbc_back.domain.model.WalletTransaction;

public interface WalletTransactionRepository {
    void save(WalletTransaction tx);
}
