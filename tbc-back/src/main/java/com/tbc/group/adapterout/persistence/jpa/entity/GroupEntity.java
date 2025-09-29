// adapterout/persistence/jpa/entity/GroupEntity.java
package com.tbc.group.adapterout.persistence.jpa.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name="events")
@Entity
public class GroupEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;
    @Column(nullable=false, length=120) String title;
    @Column(nullable=false, length=60)  String category;
    @Column(nullable=false, length=120) String topic;
    @Column(nullable=false) int minParticipants;
    @Column(nullable=false) int maxParticipants;
    @Column(nullable=false) int capacity;                // 최대 인원 (maxParticipants와 동일)
    @Column(nullable=false) int joined = 0;              // 현재 참가자 수 (기본값: 0)
    @Column(length=500, nullable=false) String coverUrl = "";  // 커버 이미지 URL (기본값: 빈 문자열)
    @Column(nullable=false, length=16) String mode;      // ONLINE/OFFLINE
    @Column(nullable=false, length=8)  String feeType;   // FREE/PAID
    Integer feeAmount;
    @Lob String feeInfo;
    @Lob String tagsCsv;          // 간단하게 CSV 저장(필요 시 별도 테이블로 확장)
    @Lob String contentHtml;
    @Column(nullable=false) Long hostId;
    @Column(length=200) String location;
    @Column LocalDate eventDate;
    @Column LocalTime eventTime;
    @Column LocalDateTime startAt;  // 시작 시간 (eventDate + eventTime 조합)
    @CreationTimestamp @Column(nullable=false, updatable=false) LocalDateTime createdAt;
    @UpdateTimestamp   @Column(nullable=false) LocalDateTime updatedAt;
}
