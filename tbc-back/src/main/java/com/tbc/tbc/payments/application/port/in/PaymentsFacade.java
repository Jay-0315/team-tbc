package com.tbc.tbc.payments.application.port.in;

import com.tbc.tbc.payments.adapter.in.web.dto.ConfirmRequest;
import com.tbc.tbc.payments.adapter.in.web.dto.ConfirmResponse;
import com.tbc.tbc.payments.adapter.in.web.dto.CreatePaymentRequest;
import com.tbc.tbc.payments.adapter.in.web.dto.CreatePaymentResponse;
import com.tbc.tbc.payments.adapter.in.web.dto.RefundRequest;
import com.tbc.tbc.payments.adapter.in.web.dto.RefundResponse;

public interface PaymentsFacade {
    CreatePaymentResponse create(CreatePaymentRequest req);
    ConfirmResponse confirm(ConfirmRequest req);
    RefundResponse refund(RefundRequest req);
}