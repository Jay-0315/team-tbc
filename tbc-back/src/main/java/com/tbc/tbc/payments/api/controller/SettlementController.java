package com.tbc.tbc.payments.api.controller;

import com.tbc.tbc.payments.api.dto.*;
import com.tbc.tbc.payments.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/settlements")
@RequiredArgsConstructor
public class SettlementController {

    private final SettlementService settlementService;

    @PostMapping("/close")
    public SettlementResponse close(@RequestBody SettlementRequest req) {
        return settlementService.close(req);
    }
}
