package com.tbc.tbc.meeting.application.service;

import com.tbc.tbc.meeting.application.port.in.JoinMeetingUseCase;
import com.tbc.tbc.meeting.application.port.out.ParticipantRepositoryPort;
import com.tbc.tbc.meeting.domain.model.Participant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MeetingService implements JoinMeetingUseCase {

    private final ParticipantRepositoryPort participantRepository;

    @Override
    @Transactional
    public void join(Long userId, Long meetingId) {
        if (participantRepository.existsByUserIdAndMeetingId(userId, meetingId)) {
            throw new IllegalArgumentException("이미 참가한 모임입니다.");
        }

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
