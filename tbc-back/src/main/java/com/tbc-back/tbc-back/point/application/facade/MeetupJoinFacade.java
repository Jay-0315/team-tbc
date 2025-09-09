package com.tbc_back.tbc_back.application.facade;

import com.tbc_back.tbc_back.application.port.in.DeductPointUseCase;
import com.tbc_back.tbc_back.domain.model.Meetup;
import com.tbc_back.tbc_back.domain.repository.MeetupRepository;
import com.tbc_back.tbc_back.adapters.out.persistence.MeetupParticipantPersistenceAdapter;
import com.tbc_back.tbc_back.adapters.in.web.dto.ParticipantResponse; // ⬅️ 추가
import com.tbc_back.tbc_back.application.exception.AlreadyJoinedException; // ⬅️ 추가
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List; // ⬅️ 추가

@Component
@RequiredArgsConstructor
public class MeetupJoinFacade {

    private final MeetupRepository meetupRepository;
    private final DeductPointUseCase deductPointUseCase;
    private final MeetupParticipantPersistenceAdapter participantAdapter;

    @Transactional
    public void joinMeetup(String userId, String meetupId) {
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

    // ⬇️ 참가자 목록 조회 추가
    @Transactional(readOnly = true)
    public List<ParticipantResponse> listParticipants(String meetupId, boolean excludeCancelled) {
        return participantAdapter.findParticipants(meetupId, excludeCancelled);
    }
}
