package com.tbc.payments.application.service;

import com.tbc.payments.domain.webhook.WebhookEvent;
import com.tbc.payments.domain.webhook.WebhookStatus;
import com.tbc.payments.application.port.out.WebhookEventPersistencePort;
import com.tbc.payments.application.service.PaymentWebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebhookRetryService {

    private final WebhookEventPersistencePort eventRepo;
    private final PaymentWebhookService webhookService;

    @Transactional
    public String retryFailedEvents() {
        var failed = eventRepo.findByStatus(WebhookStatus.FAILED);

        StringBuilder report = new StringBuilder();
        for (WebhookEvent e : failed) {
            try {
                webhookService.process(e);
                e.setStatus(WebhookStatus.SUCCESS);
                e.setProcessedAt(java.time.LocalDateTime.now());
                e.setLastError(null);
                report.append("✅ 재처리 성공: ").append(e.getEventId()).append("\n");
            } catch (Exception ex) {
                log.error("❌ 재처리 실패 eventId={}", e.getEventId(), ex);
                e.setLastError(ex.getMessage());
                // 여전히 FAILED 유지
                report.append("❌ 재처리 실패: ").append(e.getEventId())
                        .append(" (").append(ex.getMessage()).append(")\n");
            }
            eventRepo.save(e);
        }
        return report.toString();
    }
}