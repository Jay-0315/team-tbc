package com.tbc.tbc.payments.client.dto;

public record TossConfirmReq(String paymentKey, String orderId, Long amount) {}
