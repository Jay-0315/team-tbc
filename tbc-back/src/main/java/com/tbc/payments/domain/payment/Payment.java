package com.tbc.payments.domain.payment;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "payments")
public class Payment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="order_id", nullable=false, unique=true)
    private String orderId;

    @Column(name="user_id", nullable=false)
    private Long userId;

    @Column(nullable=false)
    private Long amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false, length=32)
    private PaymentState state; // INIT/PAID/REFUND_REQUESTED/REFUNDED

    @Column(length=64)
    private String paymentKey;

    @Column(length=64)
    private String failureCode;

    @Column(length=255)
    private String failureMsg;

    @Column(name="created_at", nullable=false)
    private LocalDateTime createdAt;

    @Column(name="updated_at", nullable=false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}