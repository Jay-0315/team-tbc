package com.tbc.point.adapters.out;

import com.tbc.payments.application.port.out.MeetupPointPort;
import com.tbc.point.application.service.DeductPointService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * point 모듈의 DeductPointService를 감싸서 payments 모듈에서 사용할 수 있게 하는 어댑터
 */
@Component
@RequiredArgsConstructor
public class MeetupPointAdapter implements MeetupPointPort {

    private final DeductPointService deductPointService;

    @Override
    public void deductForMeetup(Long userId, Long meetupId, Long amount, String externalRef, String reason) {
        deductPointService.deduct(userId, meetupId, amount, externalRef, reason);
    }
}