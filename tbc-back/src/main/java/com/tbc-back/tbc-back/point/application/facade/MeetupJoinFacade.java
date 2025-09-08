package com.tbc_back.tbc_back.application.facade;

import com.tbc_back.tbc_back.application.port.in.DeductPointUseCase;
import com.tbc_back.tbc_back.domain.model.Meetup;
import com.tbc_back.tbc_back.domain.repository.MeetupRepository;
import com.tbc_back.tbc_back.adapters.out.persistence.MeetupParticipantPersistenceAdapter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class MeetupJoinFacade {

    private final MeetupRepository meetupRepository;
    private final DeductPointUseCase deductPointUseCase;
    private final MeetupParticipantPersistenceAdapter participantAdapter;

    @Transactional
    public void joinMeetup(String userId, String meetupId) {
        Meetup meetup = meetupRepository.findById(meetupId)
                .orElseThrow(() -> new IllegalArgumentException("Meetup not found: " + meetupId));

        int cost = meetup.getPricePoints();
        String externalRef = "join-" + meetupId + "-" + userId;

        // 1) 포인트 차감
        deductPointUseCase.deduct(userId, meetupId, cost, externalRef, "MEETUP_JOIN");

        // 2) 참가자 등록
        participantAdapter.save(meetupId, userId, "ATTENDEE", "CONFIRMED");
    }
}
