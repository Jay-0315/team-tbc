package com.tbc.tbc.payments.domain.wallet;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name="wallet_ledger",
        uniqueConstraints = @UniqueConstraint(columnNames = "idempotency_key"))
public class WalletLedger {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private Long walletId;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private LedgerType type; // CREDIT / DEBIT

    @Column(nullable=false)
    private Long amount;

    @Column(nullable=false)
    private String reason; // e.g. TOPUP

    private String refType; // PAYMENT
    private String refId;   // orderId or paymentKey

    @Column(name="idempotency_key", nullable=false)
    private String idempotencyKey;

    @Column(nullable=false, updatable=false)
    private Instant createdAt = Instant.now();
}
