package com.tbc_back.tbc_back.adapters.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "wallets")
@Getter @Setter
public class WalletEntity {

    @Id
    @Column(name = "id", columnDefinition = "CHAR(36)")
    private String id;

    @Column(name = "owner_type", length = 20, nullable = false)
    private String ownerType;

    @Column(name = "owner_user_id", columnDefinition = "CHAR(36)")
    private String ownerUserId;

    @Column(name = "balance_points", nullable = false)
    private long balancePoints;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}
