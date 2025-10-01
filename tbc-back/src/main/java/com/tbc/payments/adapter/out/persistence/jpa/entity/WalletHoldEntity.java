package com.tbc.payments.adapter.out.persistence.jpa.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "wallet_holds", indexes = {
        @Index(name = "idx_hold_group", columnList = "group_id")
})
public class WalletHoldEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;
    @Column(name = "user_id", nullable = false) Long userId;
    @Column(name = "group_id", nullable = false) Long groupId;
    @Column(name = "amount", nullable = false) Long amount;
    @Column(name = "status", nullable = false, length = 16) String status; // HELD, RELEASED, CAPTURED
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) Instant createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false) Instant updatedAt;
}



