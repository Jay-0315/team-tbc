package com.tbc.point.domain.repository;

import com.tbc.point.domain.model.WalletTransaction;

public interface WalletTransactionRepository {
    void save(WalletTransaction tx);
}
