package com.tbc.tbc.payments.domain.payment;

public enum PaymentState {
    INIT, PAID, FAILED, CANCELED, REFUND_REQUESTED, REFUNDED;

    public boolean canTransitTo(PaymentState next) {
        return switch (this) {
            case INIT -> next == PAID || next == FAILED || next == CANCELED;
            case PAID -> next == REFUND_REQUESTED || next == REFUNDED;
            case REFUND_REQUESTED -> next == REFUNDED;
            default -> false;
        };
    }
}
