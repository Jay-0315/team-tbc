package com.tbc.tbc.payments.application.port.in;

import com.tbc.tbc.payments.adapter.in.web.dto.RefundRequest;
import com.tbc.tbc.payments.adapter.in.web.dto.RefundResponse;

public interface RefundUseCase {
    RefundResponse refund(RefundRequest req);
}