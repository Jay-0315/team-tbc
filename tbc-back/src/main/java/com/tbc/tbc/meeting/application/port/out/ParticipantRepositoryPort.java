package com.tbc.tbc.meeting.application.port.out;

import com.tbc.tbc.meeting.domain.model.Participant;

public interface ParticipantRepositoryPort {
    boolean existsByUserIdAndMeetingId(Long userId, Long meetingId);
    Participant save(Participant participant);
}