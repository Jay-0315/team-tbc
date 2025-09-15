package com.tbc.tbc.payments.adapter.in.webhook;

import com.tbc.tbc.payments.application.service.PaymentWebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/payments/webhook")
public class PaymentWebhookController {

    private final PaymentWebhookService webhookService;

    @PostMapping
    public ResponseEntity<Void> receive(
            @RequestHeader(value = "X-Toss-Event-Id", required = false) String hdrEventId,
            @RequestHeader(value = "X-Toss-Event-Type", required = false) String hdrEventType,
            @RequestBody String rawJson // ★ 바디 원문
    ) {
        webhookService.ingest(hdrEventId, hdrEventType, rawJson);
        return ResponseEntity.ok().build(); // PG가 200을 원함 (재시도 트리거 방지)
    }
}
