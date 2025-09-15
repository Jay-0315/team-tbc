package com.tbc.tbc.payments.adapter.in.web;


import com.tbc.tbc.payments.adapter.in.web.dto.RefundRequest;
import com.tbc.tbc.payments.adapter.in.web.dto.RefundResponse;
import com.tbc.tbc.payments.application.port.in.PaymentsFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/refunds")
@RequiredArgsConstructor
public class RefundController {

    private final PaymentsFacade paymentsFacade;

    @PostMapping
    public RefundResponse refund(@RequestBody RefundRequest req) {
        return paymentsFacade.refund(req);
    }
}
