package com.tbc_back.tbc_back.application.port.in;

public interface DeductPointUseCase {
    void deduct(Long userId, Long meetupId, long amountPoints, String externalRef, String description);
}
