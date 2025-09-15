package com.tbc.tbc.payments.adapter.in.web;

import com.tbc.tbc.payments.application.service.WalletReconcileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/reconcile")
public class AdminReconcileController {

    private final WalletReconcileService reconcileService;

    @PostMapping("/wallets")
    public ResponseEntity<String> reconcileWallets() {
        return ResponseEntity.ok(reconcileService.reconcileAll());
    }
}

