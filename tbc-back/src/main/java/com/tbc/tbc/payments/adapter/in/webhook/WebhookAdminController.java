package com.tbc.tbc.payments.adapter.in.webhook;

import com.tbc.tbc.payments.application.service.WebhookRetryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/webhooks")
public class WebhookAdminController {

    private final WebhookRetryService retryService;

    @PostMapping("/retry")
    public ResponseEntity<String> retryFailed() {
        String result = retryService.retryFailedEvents();
        return ResponseEntity.ok(result);
    }
}
