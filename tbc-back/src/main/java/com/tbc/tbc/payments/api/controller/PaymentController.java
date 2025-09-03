package com.tbc.tbc.payments.api.controller;

import com.tbc.tbc.payments.api.dto.*;
import com.tbc.tbc.payments.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // 결제 시작 전 INIT (orderId 예약)
    @PostMapping
    public CreatePaymentResponse create(@RequestBody CreatePaymentRequest req) {
        return paymentService.createInit(req);
    }

    // successUrl에서 받은 3개 값으로 Confirm 호출
    @PostMapping("/confirm")
    public ConfirmResponse confirm(@RequestBody ConfirmRequest req) {
        return paymentService.confirmAndCredit(req);
    }
}
