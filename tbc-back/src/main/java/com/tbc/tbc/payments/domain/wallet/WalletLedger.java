package com.tbc.tbc.payments.domain.wallet;

import com.tbc.tbc.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name="wallet_ledger",
        uniqueConstraints = @UniqueConstraint(columnNames = "idempotency_key"),
        indexes = @Index(name="idx_wallet_id_created_at", columnList = "wallet_id, created_at"))
public class WalletLedger extends BaseTimeEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private Long walletId;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false, length=16)
    private LedgerType type; // CREDIT / DEBIT

    @Column(nullable=false)
    private Long amount;

    @Column(nullable=false, length=20)
    private String reason; // e.g. TOPUP

    @Column(length=20)
    private String refType; // PAYMENT

    @Column(length=64)
    private String refId;   // orderId or paymentKey

    @Column(name="idempotency_key", nullable=false, length=64)
    private String idempotencyKey;
}
