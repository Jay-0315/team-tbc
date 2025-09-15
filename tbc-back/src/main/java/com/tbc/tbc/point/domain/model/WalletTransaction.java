package com.tbc.tbc.point.domain.model;

import java.time.Instant;

public class WalletTransaction {
    public enum Type { DEBIT, CREDIT }
    public enum Status { PENDING, SUCCESS, FAILED }

    private final Long id;                  // BIGINT
    private final Long walletId;            // BIGINT
    private final Type type;
    private final Status status;
    private final long amount;              // BIGINT
    private final Long meetupId;            // BIGINT (nullable)
    private final Long counterpartyWalletId;// BIGINT (nullable)
    private final String externalRef;       // VARCHAR(255) (nullable)
    private final String description;       // VARCHAR(255) (nullable)
    private final Instant createdAt;
    private final Instant settledAt;

    public WalletTransaction(
            Long id,
            Long walletId,
            Type type,
            Status status,
            long amount,
            Long meetupId,
            Long counterpartyWalletId,
            String externalRef,
            String description,
            Instant createdAt,
            Instant settledAt
    ) {
        this.id = id;
        this.walletId = walletId;
        this.type = type;
        this.status = status;
        this.amount = amount;
        this.meetupId = meetupId;
        this.counterpartyWalletId = counterpartyWalletId;
        this.externalRef = externalRef;
        this.description = description;
        this.createdAt = createdAt;
        this.settledAt = settledAt;
    }

    public Long getId() { return id; }
    public Long getWalletId() { return walletId; }
    public Type getType() { return type; }
    public Status getStatus() { return status; }
    public long getAmount() { return amount; }
    public Long getMeetupId() { return meetupId; }
    public Long getCounterpartyWalletId() { return counterpartyWalletId; }
    public String getExternalRef() { return externalRef; }
    public String getDescription() { return description; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getSettledAt() { return settledAt; }
}
