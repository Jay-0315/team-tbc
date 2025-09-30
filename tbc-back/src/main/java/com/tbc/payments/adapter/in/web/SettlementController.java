package com.tbc.payments.adapter.in.web;

import com.tbc.payments.adapter.in.web.dto.*;
import com.tbc.payments.application.service.SettlementService;
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
