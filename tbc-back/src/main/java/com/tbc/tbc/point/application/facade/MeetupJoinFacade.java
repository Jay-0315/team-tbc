package com.tbc.tbc.point.application.facade;

import com.tbc.tbc.point.application.port.in.DeductPointUseCase;
import com.tbc.tbc.point.domain.model.Meetup;
import com.tbc.tbc.point.domain.repository.MeetupRepository;
import com.tbc.tbc.point.adapters.out.persistence.MeetupParticipantPersistenceAdapter;
import com.tbc.tbc.point.adapters.in.web.dto.ParticipantResponse;
import com.tbc.tbc.point.application.exception.AlreadyJoinedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MeetupJoinFacade {

    private final MeetupRepository meetupRepository;
    private final DeductPointUseCase deductPointUseCase;
    private final MeetupParticipantPersistenceAdapter participantAdapter;

    @Transactional
    public void joinMeetup(Long userId, Long meetupId) { // String → Long
        // ⬇️ 중복 참가 방지
        if (participantAdapter.existsActive(meetupId, userId)) {
            throw new AlreadyJoinedException(); // 409로 매핑할 예정
        }

        Meetup meetup = meetupRepository.findById(meetupId)
                .orElseThrow(() -> new IllegalArgumentException("Meetup not found: " + meetupId));

        int cost = meetup.getPricePoints();
        String externalRef = "join-" + meetupId + "-" + userId;

        // 1) 포인트 차감
        deductPointUseCase.deduct(userId, meetupId, cost, externalRef, "MEETUP_JOIN");

        // 2) 참가자 등록
        participantAdapter.save(meetupId, userId, "ATTENDEE", "CONFIRMED");
    }

    // ⬇️ 참가자 목록 조회
    @Transactional(readOnly = true)
    public List<ParticipantResponse> listParticipants(Long meetupId, boolean excludeCancelled) { // String → Long
        return participantAdapter.findParticipants(meetupId, excludeCancelled);
    }
}
