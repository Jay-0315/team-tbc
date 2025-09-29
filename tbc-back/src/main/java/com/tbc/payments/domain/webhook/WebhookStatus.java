package com.tbc.payments.domain.webhook;

public enum WebhookStatus {
    PENDING,   // 수신 저장만 된 상태 (처리 대기)
    SUCCESS,     // 처리 성공
    FAILED      // 처리 실패 (재시도 대상)
}