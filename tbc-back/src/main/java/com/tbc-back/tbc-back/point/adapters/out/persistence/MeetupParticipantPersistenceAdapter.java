package com.tbc_back.tbc_back.adapters.out.persistence;

import com.tbc_back.tbc_back.adapters.out.persistence.entity.MeetupParticipantEntity;
import com.tbc_back.tbc_back.adapters.out.persistence.entity.MeetupParticipantId;
import com.tbc_back.tbc_back.adapters.out.persistence.jpa.SpringDataMeetupParticipantJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class MeetupParticipantPersistenceAdapter {

    private final SpringDataMeetupParticipantJpaRepository jpa;

    public void save(String meetupId, String userId, String role, String status) {
        MeetupParticipantEntity entity = new MeetupParticipantEntity();
        entity.setId(new MeetupParticipantId(meetupId, userId));
        entity.setRole(role);
        entity.setStatus(status);
        entity.setJoinedAt(Instant.now());

        jpa.save(entity);
    }
}
