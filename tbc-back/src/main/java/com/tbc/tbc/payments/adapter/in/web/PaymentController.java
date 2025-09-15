package com.tbc.tbc.payments.adapter.in.web;

import com.tbc.tbc.payments.adapter.in.web.dto.*;
import com.tbc.tbc.payments.application.port.in.PaymentsFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentsFacade paymentsFacade;

    // 결제 시작 전 INIT (orderId 예약)
    @PostMapping
    public CreatePaymentResponse create(@RequestBody CreatePaymentRequest req) {
        return paymentsFacade.create(req);
    }

    // successUrl에서 받은 3개 값으로 Confirm 호출
    @PostMapping("/confirm")
    public ConfirmResponse confirm(@RequestBody ConfirmRequest req) {
        return paymentsFacade.confirm(req);
    }
}
