package com.tbc.payments.adapter.out.persistence;

import com.tbc.payments.application.port.out.WebhookEventPersistencePort;
import com.tbc.payments.domain.webhook.WebhookEvent;
import com.tbc.payments.domain.webhook.WebhookStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class WebhookEventPersistenceAdapter implements WebhookEventPersistencePort {

    private final WebhookEventRepository webhookEventRepository;

    @Override
    public Optional<WebhookEvent> findByEventId(String eventId) {
        return webhookEventRepository.findByEventId(eventId);
    }

    @Override
    public List<WebhookEvent> findTop100ByStatusOrderByReceivedAtAsc(WebhookStatus status) {
        return webhookEventRepository.findTop100ByStatusOrderByReceivedAtAsc(status);
    }

    @Override
    public List<WebhookEvent> findByStatus(WebhookStatus status) {
        return webhookEventRepository.findByStatus(status);
    }

    @Override
    public WebhookEvent save(WebhookEvent event) {
        return webhookEventRepository.save(event);
    }
}