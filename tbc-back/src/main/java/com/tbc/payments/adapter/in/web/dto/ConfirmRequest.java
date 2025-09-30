package com.tbc.payments.adapter.in.web.dto;

public record ConfirmRequest(
        String paymentKey,
        String orderId,
        Long amount,
        Long meetupId,
        Boolean autoDeduct
) {}
