package com.tbc.payments.adapter.in.web;

import com.tbc.payments.application.facade.PaymentsFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {
    private final PaymentsFacade payments;

    public record BalanceRes(long balance) {}
    public record ChargeReq(long amount) {}

    @GetMapping("/balance")
    public BalanceRes balance(@RequestHeader("X-User-Id") Long userId) {
        return new BalanceRes(payments.getBalance(userId));
    }

    @PostMapping("/charge")
    public ResponseEntity<Void> charge(@RequestHeader("X-User-Id") Long userId, @RequestBody ChargeReq req) {
        payments.charge(userId, req.amount());
        return ResponseEntity.ok().build();
    }
}



