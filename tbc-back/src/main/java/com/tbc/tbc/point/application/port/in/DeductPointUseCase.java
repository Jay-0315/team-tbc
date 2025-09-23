package com.tbc.tbc.point.application.port.in;

public interface DeductPointUseCase {
    void deduct(Long userId, Long meetupId, long amountPoints, String externalRef, String description);
}
