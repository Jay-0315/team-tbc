package com.tbc.payments.application.port.out;

import com.tbc.payments.domain.webhook.WebhookEvent;
import com.tbc.payments.domain.webhook.WebhookStatus;

import java.util.List;
import java.util.Optional;

public interface WebhookEventPersistencePort {
    Optional<WebhookEvent> findByEventId(String eventId);
    List<WebhookEvent> findTop100ByStatusOrderByReceivedAtAsc(WebhookStatus status);
    List<WebhookEvent> findByStatus(WebhookStatus status);
    WebhookEvent save(WebhookEvent event);
}