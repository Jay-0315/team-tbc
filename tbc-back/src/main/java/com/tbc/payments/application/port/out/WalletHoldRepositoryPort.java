package com.tbc.payments.application.port.out;

import com.tbc.payments.domain.model.WalletHold;

import java.util.List;

public interface WalletHoldRepositoryPort {
    WalletHold save(WalletHold hold);
    List<WalletHold> findActiveByGroupId(Long groupId);
    void captureByGroupId(Long groupId);
    void releaseByGroupId(Long groupId);
}



