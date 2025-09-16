package com.tbc.tbc.point.adapters.out.persistence;

import com.tbc.tbc.point.adapters.in.web.dto.ParticipantResponse;
import com.tbc.tbc.point.adapters.out.persistence.entity.MeetupParticipantEntity;
import com.tbc.tbc.point.adapters.out.persistence.entity.MeetupParticipantId;
import com.tbc.tbc.point.adapters.out.persistence.jpa.SpringDataMeetupParticipantJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
public class MeetupParticipantPersistenceAdapter {

    private final SpringDataMeetupParticipantJpaRepository jpa;

    /** 참가자 저장 */
    public void save(Long meetupId, Long userId, String role, String status) {
        MeetupParticipantEntity entity = new MeetupParticipantEntity();
        entity.setId(new MeetupParticipantId(meetupId, userId)); // Long 기반
        entity.setRole(role);
        entity.setStatus(status);
        entity.setJoinedAt(Instant.now());
        jpa.save(entity);
    }

    /** 중복 참가 여부 */
    public boolean existsActive(Long meetupId, Long userId) {
        return jpa.existsByIdMeetupIdAndIdUserIdAndStatusNot(meetupId, userId, "CANCELLED");
    }

    /** 참가자 목록 */
    public List<ParticipantResponse> findParticipants(Long meetupId, boolean excludeCancelled) {
        List<MeetupParticipantEntity> rows = excludeCancelled
                ? jpa.findByIdMeetupIdAndStatusNot(meetupId, "CANCELLED")
                : jpa.findByIdMeetupId(meetupId);

        return rows.stream()
                .map(e -> new ParticipantResponse(
                        String.valueOf(e.getId().getUserId()), // DTO는 String 필요 → 변환
                        e.getRole(),
                        e.getStatus(),
                        e.getJoinedAt()
                ))
                .toList();
    }
}
