package com.tbc.tbc.meeting.adapter.out.persistence;

import com.tbc.tbc.meeting.application.port.out.ParticipantRepositoryPort;
import com.tbc.tbc.meeting.domain.model.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaParticipantRepository extends JpaRepository<Participant, Long>, ParticipantRepositoryPort {
    boolean existsByUserIdAndMeetingIdAndStatusNot(Long userId, Long meetingId, Participant.Status status);
}