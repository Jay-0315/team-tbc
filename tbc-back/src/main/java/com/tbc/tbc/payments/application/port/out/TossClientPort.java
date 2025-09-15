package com.tbc.tbc.payments.application.port.out;

import com.tbc.tbc.payments.adapter.out.client.dto.TossCancelReq;
import com.tbc.tbc.payments.adapter.out.client.dto.TossConfirmReq;
import com.tbc.tbc.payments.adapter.out.client.dto.TossPaymentRes;

public interface TossClientPort {
    TossPaymentRes confirm(TossConfirmReq req);
    TossPaymentRes cancel(String paymentKey, TossCancelReq req);
}
