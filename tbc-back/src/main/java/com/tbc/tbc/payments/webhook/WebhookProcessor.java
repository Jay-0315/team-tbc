package com.tbc.tbc.payments.webhook;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class WebhookProcessor {

    private final WebhookEventRepository eventRepo;
    private final PaymentWebhookService webhookService;

    @Scheduled(fixedDelay = 2000) // 2초마다 미처리 이벤트 처리
    @Transactional
    public void pollAndProcess() {
        eventRepo.findTop100ByProcessedFalseOrderByIdAsc()
                .forEach(e -> {
                    try {
                        webhookService.process(e);
                    } catch (Exception ex) {
                        log.error("[WH] process failed eventId={}", e.getEventId(), ex);
                        throw ex;
                    }
                });
    }
}
