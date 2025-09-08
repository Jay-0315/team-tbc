package com.tbc.tbc.payments.webhook;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payments/webhook")
@RequiredArgsConstructor
public class PaymentWebhookController {

    private final PaymentWebhookService webhookService;

    @PostMapping
    public ResponseEntity<Void> receive(@RequestBody Map<String, Object> payload,
                                        @RequestHeader(value = "X-Event-Id", required = false) String eventId,
                                        @RequestHeader(value = "X-Event-Type", required = false) String eventType) {
        webhookService.ingest(eventId, eventType, payload);
        return ResponseEntity.ok().build();
    }
}
