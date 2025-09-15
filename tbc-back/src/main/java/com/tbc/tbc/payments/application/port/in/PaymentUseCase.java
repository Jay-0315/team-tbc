package com.tbc.tbc.payments.application.port.in;

import com.tbc.tbc.payments.adapter.in.web.dto.ConfirmRequest;
import com.tbc.tbc.payments.adapter.in.web.dto.ConfirmResponse;
import com.tbc.tbc.payments.adapter.in.web.dto.CreatePaymentRequest;
import com.tbc.tbc.payments.adapter.in.web.dto.CreatePaymentResponse;

public interface PaymentUseCase {
    CreatePaymentResponse createInit(CreatePaymentRequest req);
    ConfirmResponse confirmAndCredit(ConfirmRequest req);
}
