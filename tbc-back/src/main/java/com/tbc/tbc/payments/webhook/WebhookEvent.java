package com.tbc.tbc.payments.webhook;


import com.tbc.tbc.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "webhook_events",
        uniqueConstraints = @UniqueConstraint(columnNames = "events_id"))
public class WebhookEvent extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="event_id", nullable = false, length=64)
    private String eventId;

    @Column(name="event_type", nullable = false, length = 64)
    private String eventType;

    @JdbcTypeCode(SqlTypes.JSON)    // MySQL JSON 컬럼
    @Column(columnDefinition = "json", nullable = false)
    private Map<String, Object> payload;

    @Column(name="received_at", nullable = false)
    private LocalDateTime receivedAt;

    @Column(nullable = false)
    private boolean processed;

    @Column(name="processed_at")
    private LocalDateTime processedAt;
}
