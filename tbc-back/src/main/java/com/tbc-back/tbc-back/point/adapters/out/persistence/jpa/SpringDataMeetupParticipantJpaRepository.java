package com.tbc_back.tbc_back.adapters.out.persistence.jpa;

import com.tbc_back.tbc_back.adapters.out.persistence.entity.MeetupParticipantEntity;
import com.tbc_back.tbc_back.adapters.out.persistence.entity.MeetupParticipantId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataMeetupParticipantJpaRepository
        extends JpaRepository<MeetupParticipantEntity, MeetupParticipantId> {
}
