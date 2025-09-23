package com.tbc.tbc.point.domain.repository;

import com.tbc.tbc.point.domain.model.WalletTransaction;

public interface WalletTransactionRepository {
    void save(WalletTransaction tx);
}
