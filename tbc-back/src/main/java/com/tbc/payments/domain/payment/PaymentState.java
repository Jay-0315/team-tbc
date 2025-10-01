package com.tbc.payments.domain.payment;

public enum PaymentState {
    INIT, PAID, FAILED, CANCELED, REFUND_REQUESTED, REFUNDED, PARTIALLY_REFUNDED;

    public boolean canTransitTo(PaymentState next) {
        return switch (this) {
            case INIT -> next == PAID || next == FAILED || next == CANCELED;
            case PAID -> next == REFUND_REQUESTED || next == REFUNDED || next == PARTIALLY_REFUNDED;
            case REFUND_REQUESTED -> next == REFUNDED;
            case PARTIALLY_REFUNDED -> next == REFUNDED || next == PARTIALLY_REFUNDED;
            default -> false;
        };
    }
}