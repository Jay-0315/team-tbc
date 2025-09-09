package com.tbc_back.tbc_back.adapters.out.persistence;

import com.tbc_back.tbc_back.adapters.in.web.dto.ParticipantResponse;
import com.tbc_back.tbc_back.adapters.out.persistence.entity.MeetupParticipantEntity;
import com.tbc_back.tbc_back.adapters.out.persistence.entity.MeetupParticipantId;
import com.tbc_back.tbc_back.adapters.out.persistence.jpa.SpringDataMeetupParticipantJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
public class MeetupParticipantPersistenceAdapter {

    private final SpringDataMeetupParticipantJpaRepository jpa;

    /** 참가자 저장 (기존) */
    public void save(String meetupId, String userId, String role, String status) {
        MeetupParticipantEntity entity = new MeetupParticipantEntity();
        entity.setId(new MeetupParticipantId(meetupId, userId));
        entity.setRole(role);
        entity.setStatus(status);
        entity.setJoinedAt(Instant.now());
        jpa.save(entity);
    }

    /** 중복 참가 여부: CANCELLED 가 아닌 상태로 이미 있다면 true */
    public boolean existsActive(String meetupId, String userId) {
        return jpa.existsByIdMeetupIdAndIdUserIdAndStatusNot(meetupId, userId, "CANCELLED");
    }

    /** 참가자 목록 */
    public List<ParticipantResponse> findParticipants(String meetupId, boolean excludeCancelled) {
        List<MeetupParticipantEntity> rows = excludeCancelled
                ? jpa.findByIdMeetupIdAndStatusNot(meetupId, "CANCELLED")
                : jpa.findByIdMeetupId(meetupId);

        return rows.stream()
                .map(e -> new ParticipantResponse(
                        e.getId().getUserId(),
                        e.getRole(),
                        e.getStatus(),
                        e.getJoinedAt()
                ))
                .toList();
    }
}
