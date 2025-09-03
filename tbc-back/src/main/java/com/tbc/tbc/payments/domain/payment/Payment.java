package com.tbc.tbc.payments.domain.payment;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "payments", uniqueConstraints = @UniqueConstraint(columnNames = "order_id"))
public class Payment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="order_id", nullable=false, unique=true)
    private String orderId;

    @Column(nullable=false)
    private Long userId;

    @Column(nullable=false)
    private Long amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private PaymentState state;

    private String paymentKey;
    private String failureCode;
    private String failureMsg;

    @Column(nullable=false, updatable=false)
    private Instant createdAt = Instant.now();

    @Column(nullable=false)
    private Instant updatedAt = Instant.now();

    @PreUpdate void onUpdate() { this.updatedAt = Instant.now(); }
}
