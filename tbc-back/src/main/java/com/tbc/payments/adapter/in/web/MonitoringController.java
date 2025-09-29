package com.tbc.payments.adapter.in.web;


import com.tbc.payments.application.service.MonitoringService;
import com.tbc.payments.application.service.WebhookRetryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class MonitoringController {

    private final MonitoringService monitoringService;
    private final WebhookRetryService webhookRetryService;

    @GetMapping("/monitoring/wallets/consistency")
    public ResponseEntity<String> checkWallets() {
        String report = monitoringService.checkConsistency();
        return ResponseEntity.ok(report);
    }

    @PostMapping("/monitoring/webhooks/retry")
    public ResponseEntity<String> retryWebhooks() {
        String report = webhookRetryService.retryFailedEvents();
        return ResponseEntity.ok(report);
    }
}
