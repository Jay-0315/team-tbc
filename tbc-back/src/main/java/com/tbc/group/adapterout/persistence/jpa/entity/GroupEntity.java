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
    @Builder.Default @Column(nullable=false) int joined = 0;              // 현재 참가자 수 (기본값: 0)
    @Builder.Default @Column(name="cover_url", length=500, nullable=false) String coverUrl = "";  // 커버 이미지 URL (기본값: 빈 문자열)
    @Column(nullable=false, length=16) String mode;      // ONLINE/OFFLINE
    @Column(name="fee_type", nullable=false, length=8)  String feeType;   // FREE/PAID
    @Column(name="fee_amount") Integer feeAmount;
    @Lob @Column(name="fee_info") String feeInfo;
    @Lob @Column(name="tags_csv") String tagsCsv;          // 간단하게 CSV 저장(필요 시 별도 테이블로 확장)
    @Lob @Column(name="content_html") String contentHtml;
    @Column(name="host_id", nullable=false) Long hostId;
    @Column(length=200) String location;
    @Column Double latitude;   // 위도
    @Column Double longitude;  // 경도
    @Column(name="image_path", length=500) String imagePath;  // 업로드 이미지 경로
    @Column(name="event_date") LocalDate eventDate;
    @Column(name="event_time") LocalTime eventTime;
    @Column(name="start_at") LocalDateTime startAt;  // 시작 시간 (eventDate + eventTime 조합)
    @CreationTimestamp @Column(name="created_at", nullable=false, updatable=false) LocalDateTime createdAt;
    @UpdateTimestamp   @Column(name="updated_at", nullable=false) LocalDateTime updatedAt;
}
