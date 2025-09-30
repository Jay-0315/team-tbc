package com.tbc.payments.adapter.in.web;

import com.tbc.payments.application.facade.PaymentsFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupPaymentController {
    private final PaymentsFacade payments;

    public record JoinReq() {}

    @PostMapping("/{groupId}/join")
    public ResponseEntity<Void> join(@PathVariable Long groupId, @RequestHeader("X-User-Id") Long userId) {
        payments.joinPaidGroup(groupId, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{groupId}/settle")
    public ResponseEntity<Void> settle(@PathVariable Long groupId) {
        payments.settleGroup(groupId);
        return ResponseEntity.ok().build();
    }
}



