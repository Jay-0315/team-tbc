package com.tbc_back.tbc_back.application.facade;

import com.tbc_back.tbc_back.application.port.in.DeductPointUseCase;
import com.tbc_back.tbc_back.domain.model.Meetup;
import com.tbc_back.tbc_back.domain.repository.MeetupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MeetupJoinFacade {

    private final MeetupRepository meetupRepository;
    private final DeductPointUseCase deductPointUseCase;

    public void joinMeetup(String userId, String meetupId) {
        Meetup meetup = meetupRepository.findById(meetupId)
                .orElseThrow(() -> new IllegalArgumentException("Meetup not found: " + meetupId));

        int cost = meetup.getPricePoints();
        String externalRef = "join-" + meetupId + "-" + userId; // 추후 멱등키로 재사용 가능
        deductPointUseCase.deduct(userId, meetupId, cost, externalRef, "MEETUP_JOIN");
    }
}
