package com.tbc.payments.application.port.out;

public interface MeetupPointPort {
    void deductForMeetup(Long userId, Long meetupId, Long amount, String externalRef, String reason);
}