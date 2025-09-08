package com.tbc.tbc.payments.api.controller;


import com.tbc.tbc.payments.api.dto.RefundRequest;
import com.tbc.tbc.payments.api.dto.RefundResponse;
import com.tbc.tbc.payments.service.RefundService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/refunds")
@RequiredArgsConstructor
public class RefundController {

    private final RefundService refundService;

    @PostMapping
    public RefundResponse refund(@RequestBody RefundRequest req) {
        return refundService.refund(req);
    }
}
