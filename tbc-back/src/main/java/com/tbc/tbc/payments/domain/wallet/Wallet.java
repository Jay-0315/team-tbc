package com.tbc.tbc.payments.domain.wallet;

import com.tbc.tbc.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name="wallets", uniqueConstraints = @UniqueConstraint(columnNames="user_id"))
public class Wallet extends BaseTimeEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="user_id", nullable=false, unique=true)
    private Long userId;

    @Column(nullable=false)
    private Long balance;

    @PrePersist
    void prePersist() {
        if (balance == null) balance = 0L;
    }
}
