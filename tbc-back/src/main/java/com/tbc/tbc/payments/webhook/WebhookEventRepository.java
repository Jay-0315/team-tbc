package com.tbc.tbc.payments.webhook;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WebhookEventRepository extends JpaRepository<WebhookEvent, Long> {
    Optional<WebhookEvent> findByEventId(String eventId);
    List<WebhookEvent> findTop100ByProcessedFalseOrderByIdAsc();
}
