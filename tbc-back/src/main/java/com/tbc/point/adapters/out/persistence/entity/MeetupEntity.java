package com.tbc.point.adapters.out.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** meetups 테이블 읽기용 최소 매핑 (이벤트 정보와 충돌 방지: 테이블 이름 다름) */
@Entity
@Table(name = "meetups")
@Getter
@Setter
@NoArgsConstructor
public class MeetupEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "host_id", nullable = false)
    private Long hostId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 120)
    private String topic;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "fee_amount")
    private Integer feeAmount;

    @Column(name = "fee_type", length = 8)
    private String feeType;

    @Column(nullable = false)
    private Integer capacity;

    @Column(name = "max_participants")
    private Integer maxParticipants;

    @Column(name = "min_participants")
    private Integer minParticipants;

    @Column(nullable = false)
    private Integer joined;

    @Column(nullable = false, length = 16)
    private String status;

    @Column(nullable = false, length = 16)
    private String mode;

    @Column(nullable = false, length = 200)
    private String location;

    @Column(name = "cover_url")
    private String coverUrl;

    @Lob
    private String description;

    @Lob @Column(name = "fee_info")
    private String feeInfo;

    @Lob @Column(name = "tags_csv")
    private String tagsCsv;

    @Lob @Column(name = "content_html")
    private String contentHtml;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
