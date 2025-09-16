package com.tbc.tbc.payments.domain.payment;

import com.tbc.tbc.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "payments")
public class Payment extends BaseTimeEntity {

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
}