package com.tbc.payments.application.port.in;

import com.tbc.payments.adapter.in.web.dto.*;

public interface PaymentsFacade {
    CreatePaymentResponse create(CreatePaymentRequest req);
    ConfirmResponse confirm(ConfirmRequest req);
    RefundResponse refund(RefundRequest req);
    CancelPaymentResponse cancelInit(String orderId);
}