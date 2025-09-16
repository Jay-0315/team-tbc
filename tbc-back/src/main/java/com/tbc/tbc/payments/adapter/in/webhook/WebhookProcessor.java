package com.tbc.tbc.payments.adapter.in.webhook;

import com.tbc.tbc.payments.domain.webhook.WebhookEvent;
import com.tbc.tbc.payments.domain.webhook.WebhookStatus;
import com.tbc.tbc.payments.application.port.out.WebhookEventPersistencePort;
import com.tbc.tbc.payments.application.service.PaymentWebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebhookProcessor {

    private final WebhookEventPersistencePort eventRepo;
    private final PaymentWebhookService webhookService;

    @Scheduled(fixedDelay = 2000) // 2초마다 미처리 이벤트 처리
    @Transactional
    public void pollAndProcess() {
        var toProcess = eventRepo.findTop100ByStatusOrderByReceivedAtAsc(WebhookStatus.PENDING);
        for (WebhookEvent e : toProcess) {
            try {
                webhookService.process(e);
                e.setStatus(WebhookStatus.SUCCESS);
                e.setProcessedAt(LocalDateTime.now());
                e.setLastError(null);
            } catch (Exception ex) {
                log.error("[WH] process failed eventId={}", e.getEventId(), ex);
                e.setStatus(WebhookStatus.FAILED);
                e.setAttemptCount(e.getAttemptCount() + 1);
                e.setLastError(safeMessage(ex));
            }
            eventRepo.save(e);
        }
    }

    private String safeMessage(Throwable t) {
        String m = t.getMessage();
        return (m == null || m.isBlank()) ? t.getClass().getSimpleName() : (m.length() > 900 ? m.substring(0, 900) : m);
    }
}