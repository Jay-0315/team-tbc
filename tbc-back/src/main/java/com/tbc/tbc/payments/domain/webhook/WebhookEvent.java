package com.tbc.tbc.payments.domain.webhook;

import com.tbc.tbc.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "webhook_events",
        uniqueConstraints = @UniqueConstraint(columnNames = "event_id"),
        indexes = {
                @Index(name="idx_webhook_status", columnList = "status"),
                @Index(name="idx_webhook_received_at", columnList = "received_at")
        })
public class WebhookEvent extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="event_id", nullable=false, length=128)
    private String eventId;

    @Column(name="event_type", length=64)
    private String eventType;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false, length=16)
    private WebhookStatus status; // PENDING/SUCCESS/FAILED

    @Lob
    @Column(name="payload", columnDefinition = "LONGTEXT")
    private String payload;       // ★ JSON 문자열 그대로 저장

    @Column(name="received_at", nullable=false)
    private LocalDateTime receivedAt;

    @Column(name="processed_at")
    private LocalDateTime processedAt;

    @Column(name="attempt_count", nullable=false)
    private int attemptCount;     // 재시도 횟수

    @Column(name="last_error", length=1000)
    private String lastError;    // 마지막 오류 메시지
}
