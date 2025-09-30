package com.tbc.point.domain.model;

public class Wallet {
    private final Long id;          // BIGINT
    private final Long userId;      // BIGINT
    private final long balance;     // BIGINT

    public Wallet(Long id, Long userId, long balance) {
        this.id = id;
        this.userId = userId;
        this.balance = balance;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public long getBalance() { return balance; }
}
