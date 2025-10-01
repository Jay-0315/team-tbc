package com.tbc.payments.adapter.out.persistence.jpa.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "wallets", indexes = {
        @Index(name = "uk_wallet_user", columnList = "user_id", unique = true)
})
public class WalletEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;
    @Column(name = "user_id", nullable = false, unique = true) Long userId;
    @Column(name = "balance", nullable = false) Long balance;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false) Instant updatedAt;
}



