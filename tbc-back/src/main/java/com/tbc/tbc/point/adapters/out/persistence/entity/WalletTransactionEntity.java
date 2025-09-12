package com.tbc_back.tbc_back.adapters.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "wallet_transactions")
@Getter @Setter
public class WalletTransactionEntity {

    @Id
    @Column(name = "id", columnDefinition = "CHAR(36)")
    private String id;

    @Column(name = "wallet_id", columnDefinition = "CHAR(36)", nullable = false)
    private String walletId;

    @Column(name = "type", length = 20, nullable = false)
    private String type;

    @Column(name = "status", length = 20, nullable = false)
    private String status;

    @Column(name = "amount_points", nullable = false)
    private long amountPoints;

    @Column(name = "meetup_id", columnDefinition = "CHAR(36)")
    private String meetupId;

    @Column(name = "counterparty_wallet_id", columnDefinition = "CHAR(36)")
    private String counterpartyWalletId;

    @Column(name = "external_ref", length = 255)
    private String externalRef;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "settled_at")
    private Instant settledAt;
}
