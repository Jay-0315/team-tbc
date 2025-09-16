package com.tbc.tbc.payments.adapter.out.persistence;

import com.tbc.tbc.payments.domain.webhook.WebhookEvent;
import com.tbc.tbc.payments.domain.webhook.WebhookStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WebhookEventRepository extends JpaRepository<WebhookEvent, Long> {
    Optional<WebhookEvent> findByEventId(String eventId);

    // 상태 별 오래된 순으로 최대 100건
    List<WebhookEvent> findTop100ByStatusOrderByReceivedAtAsc(WebhookStatus status);

    // 실패건만 모으기
    List<WebhookEvent> findByStatus(WebhookStatus status);
}
