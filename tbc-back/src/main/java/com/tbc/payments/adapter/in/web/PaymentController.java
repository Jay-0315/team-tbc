package com.tbc.payments.adapter.in.web;

import com.tbc.payments.adapter.in.web.dto.*;
import com.tbc.payments.application.port.in.PaymentsFacade;
import com.tbc.common.util.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentsFacade paymentsFacade;
    private final JwtUtils jwtUtils;

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

    // INIT 상태 취소
    @DeleteMapping("/{orderId}")
    public CancelPaymentResponse cancelInit(@PathVariable String orderId) {
        return paymentsFacade.cancelInit(orderId);
    }

    // 지갑 충전 시작 (INIT)
    @PostMapping("/charge")
    public CreatePaymentResponse charge(@RequestBody CreatePaymentRequest req) {
        return paymentsFacade.create(req);
    }

    // 사용자 지갑 잔액 조회
    @GetMapping("/wallet/me")
    public WalletBalanceResponse getMyWalletBalance(HttpServletRequest request) {
        Long userId = jwtUtils.getUserIdFromRequest(request);
        if (userId == null) {
            throw new IllegalArgumentException("Authentication required");
        }
        return paymentsFacade.getWalletBalance(userId);
    }
}
