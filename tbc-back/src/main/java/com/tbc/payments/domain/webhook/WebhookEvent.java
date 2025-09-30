package com.tbc.payments.domain.webhook;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "webhook_events",
        uniqueConstraints = @UniqueConstraint(columnNames = "event_id"),
        indexes = {
                @Index(name = "idx_webhook_status", columnList = "status"),
                @Index(name = "idx_webhook_received_at", columnList = "received_at")
        }
)
public class WebhookEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false, length = 128)
    private String eventId;

    @Column(name = "event_type", length = 64)
    private String eventType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private WebhookStatus status; // PENDING / SUCCESS / FAILED

    @Lob
    @Column(name = "payload", columnDefinition = "LONGTEXT")
    private String payload; // JSON 문자열 그대로 저장

    @Column(name = "received_at", nullable = false)
    private LocalDateTime receivedAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount; // 재시도 횟수

    @Column(name = "last_error", length = 1000)
    private String lastError; // 마지막 오류 메시지

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (this.receivedAt == null) {
            this.receivedAt = now; // 처음 저장할 때 수신시각 기본값
        }
        this.createdAt = now;
        this.updatedAt = now;
        if (this.attemptCount == 0) {
            this.attemptCount = 0; // 기본값 보장
        }
    }

    @PreUpdate
    void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
