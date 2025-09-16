package com.tbc.tbc.payments.adapter.out.client.dto;

public record TossConfirmReq(String paymentKey, String orderId, Long amount) {}
