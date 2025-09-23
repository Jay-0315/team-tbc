package com.tbc.tbc.meeting.application.service;

import com.tbc.tbc.meeting.application.port.in.JoinMeetingUseCase;
import com.tbc.tbc.meeting.application.port.out.ParticipantRepositoryPort;
import com.tbc.tbc.point.application.port.in.DeductPointUseCase;
import com.tbc.tbc.point.application.exception.AlreadyJoinedException;
import com.tbc.tbc.point.adapters.out.persistence.entity.MeetupEntity;
import com.tbc.tbc.point.adapters.out.persistence.jpa.SpringDataMeetupJpaRepository;
import com.tbc.tbc.meeting.domain.model.Participant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MeetingService implements JoinMeetingUseCase {

    private final ParticipantRepositoryPort participantRepository;
    private final DeductPointUseCase deductPointUseCase;
    private final SpringDataMeetupJpaRepository meetupRepo;

    @Override
    @Transactional
    public void join(Long userId, Long meetingId) {
        if (participantRepository.existsByUserIdAndMeetingIdAndStatusNot(userId, meetingId, Participant.Status.CANCELLED)) {
            throw new AlreadyJoinedException();
        }

        // 결제 금액 조회
        MeetupEntity meetup = meetupRepo.findById(meetingId)
                .orElseThrow(() -> new IllegalArgumentException("Meetup not found: " + meetingId));
        int price = meetup.getPricePoints();

        // 포인트 차감 (멱등/락은 내부 구현)
        String idemKey = "JOIN:" + meetingId + ":" + userId;
        deductPointUseCase.deduct(userId, meetingId, price, idemKey, "MEETUP_JOIN");

        // 참가 저장
        participantRepository.save(
                Participant.builder()
                        .userId(userId)
                        .meetingId(meetingId)
                        .status(Participant.Status.JOINED)
                        .build()
        );
    }

    @Override
    public boolean canEnterChat(Long userId, Long meetingId) {
        return participantRepository.existsByUserIdAndMeetingId(userId, meetingId);
    }

}