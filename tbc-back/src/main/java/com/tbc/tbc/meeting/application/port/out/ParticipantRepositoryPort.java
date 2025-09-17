package com.tbc.tbc.meeting.application.port.out;

import com.tbc.tbc.meeting.domain.model.Participant;

public interface ParticipantRepositoryPort {
    boolean existsByUserIdAndMeetingId(Long userId, Long meetingId);
    boolean existsByUserIdAndMeetingIdAndStatusNot(Long userId, Long meetingId, Participant.Status status);
    Participant save(Participant participant);
}