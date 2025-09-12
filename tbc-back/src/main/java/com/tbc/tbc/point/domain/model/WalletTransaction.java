package com.tbc_back.tbc_back.domain.model;

import java.time.Instant;

public class WalletTransaction {
    public enum Type { DEBIT, CREDIT }
    public enum Status { PENDING, SUCCESS, FAILED }

    private final String id;                  // CHAR(36)
    private final String walletId;            // CHAR(36)
    private final Type type;                  // DEBIT/CREDIT
    private final Status status;              // PENDING/SUCCESS/FAILED
    private final long amountPoints;          // BIGINT
    private final String meetupId;            // CHAR(36) (nullable)
    private final String counterpartyWalletId;// CHAR(36) (nullable)
    private final String externalRef;         // VARCHAR(255) (nullable)
    private final String description;         // VARCHAR(255) (nullable)
    private final Instant createdAt;          // TIMESTAMP
    private final Instant settledAt;          // TIMESTAMP (nullable)

    public WalletTransaction(
            String id,
            String walletId,
            Type type,
            Status status,
            long amountPoints,
            String meetupId,
            String counterpartyWalletId,
            String externalRef,
            String description,
            Instant createdAt,
            Instant settledAt
    ) {
        this.id = id;
        this.walletId = walletId;
        this.type = type;
        this.status = status;
        this.amountPoints = amountPoints;
        this.meetupId = meetupId;
        this.counterpartyWalletId = counterpartyWalletId;
        this.externalRef = externalRef;
        this.description = description;
        this.createdAt = createdAt;
        this.settledAt = settledAt;
    }

    public String getId() { return id; }
    public String getWalletId() { return walletId; }
    public Type getType() { return type; }
    public Status getStatus() { return status; }
    public long getAmountPoints() { return amountPoints; }
    public String getMeetupId() { return meetupId; }
    public String getCounterpartyWalletId() { return counterpartyWalletId; }
    public String getExternalRef() { return externalRef; }
    public String getDescription() { return description; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getSettledAt() { return settledAt; }
}
