package com.tbc.tbc.payments.application.port.out;

import com.tbc.tbc.payments.domain.payment.Payment;

import java.util.Optional;

public interface PaymentPersistencePort {
    Optional<Payment> findByOrderId(String orderId);
    Payment savePayment(Payment payment);
}
