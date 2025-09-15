// adapterout/persistence/jpa/entity/GroupEntity.java
package com.tbc.group.adapterout.persistence.jpa.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name="varigroups")
@Entity
public class GroupEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;
    @Column(nullable=false, length=120) String title;
    @Column(nullable=false, length=60)  String category;
    @Column(nullable=false, length=120) String topic;
    @Column(nullable=false) int minParticipants;
    @Column(nullable=false) int maxParticipants;
    @Column(nullable=false, length=16) String mode;      // ONLINE/OFFLINE
    @Column(nullable=false, length=8)  String feeType;   // FREE/PAID
    Integer feeAmount;
    @Lob String feeInfo;
    @Lob String tagsCsv;          // 간단하게 CSV 저장(필요 시 별도 테이블로 확장)
    @Lob String contentHtml;
    @Column(nullable=false) Long hostId;
    @CreationTimestamp @Column(nullable=false, updatable=false) LocalDateTime createdAt;
    @UpdateTimestamp   @Column(nullable=false) LocalDateTime updatedAt;
}
