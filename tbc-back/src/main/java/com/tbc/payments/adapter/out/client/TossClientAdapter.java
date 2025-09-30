package com.tbc.payments.adapter.out.client;

import com.tbc.payments.adapter.out.client.dto.TossCancelReq;
import com.tbc.payments.adapter.out.client.dto.TossConfirmReq;
import com.tbc.payments.adapter.out.client.dto.TossPaymentRes;
import com.tbc.payments.application.port.out.TossClientPort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class TossClientAdapter implements TossClientPort {

    private final RestClient tossRestClient;

    @Override
    public TossPaymentRes confirm(TossConfirmReq req) {
        return tossRestClient.post()
                .uri("/v1/payments/confirm")
                .body(req)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (reqSpec, resp) -> {
                    try (var reader = new BufferedReader(new InputStreamReader(resp.getBody(), StandardCharsets.UTF_8))) {
                        String body = reader.lines().collect(java.util.stream.Collectors.joining("\n"));
                        throw new IllegalStateException("TOSS_CONFIRM_FAILED: " + body);
                    } catch (IOException e) {
                        throw new IllegalStateException("TOSS_CONFIRM_FAILED (no body)", e);
                    }
                })
                .body(TossPaymentRes.class);
    }

    @Override
    public TossPaymentRes cancel(String paymentKey, TossCancelReq req) {
        return tossRestClient.post()
                .uri("/v1/payments/" + paymentKey + "/cancel")
                .body(req)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (reqSpec, resp) -> {
                    try (var reader = new BufferedReader(new InputStreamReader(resp.getBody(), StandardCharsets.UTF_8))) {
                        String body = reader.lines().collect(java.util.stream.Collectors.joining("\n"));
                        throw new IllegalStateException("TOSS_REFUND_FAILED: " + body);
                    }
                })
                .body(TossPaymentRes.class);
    }
}