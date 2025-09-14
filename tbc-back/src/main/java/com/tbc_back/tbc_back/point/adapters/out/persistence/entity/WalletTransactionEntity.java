package com.tbc_back.tbc_back.point.adapters.out.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "wallet_ledger")
@Getter @Setter
public class WalletTransactionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AUTO_INCREMENT
    @Column(name = "id")
    private Long id;

    @Column(name = "wallet_id", nullable = false)
    private Long walletId;   // BIGINT

    @Column(name = "amount", nullable = false)
    private long amount;   // amount_points → amount 로 변경

    @Column(name = "type", length = 16, nullable = false)
    private String type;

    @Column(name = "ref_type", length = 20)
    private String refType;

    @Column(name = "ref_id", length = 64)
    private String refId;

    @Column(name = "reason", length = 20)
    private String reason;

    @Column(name = "idempotency_key", length = 64)
    private String idempotencyKey;

    @Column(name = "created_at",
            columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private Instant createdAt;

    @Column(name = "updated_at",
            columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    private Instant updatedAt;
}
