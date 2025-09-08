package com.tbc_back.tbc_back.domain.model;

public class Wallet {
    private final String id;           // CHAR(36)
    private final String ownerUserId;  // CHAR(36)
    private final long balancePoints;  // BIGINT

    public Wallet(String id, String ownerUserId, long balancePoints) {
        this.id = id;
        this.ownerUserId = ownerUserId;
        this.balancePoints = balancePoints;
    }

    public String getId() { return id; }
    public String getOwnerUserId() { return ownerUserId; }
    public long getBalancePoints() { return balancePoints; }
}
