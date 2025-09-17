package com.tbc.tbc.point.adapters.out.persistence;

import com.tbc.tbc.point.adapters.in.web.dto.ParticipantResponse;
import com.tbc.tbc.point.adapters.out.persistence.entity.MeetupParticipantEntity;
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
        entity.setMeetingId(meetupId);
        entity.setUserId(userId);
        entity.setRole(role == null || role.isBlank() ? "ATTENDEE" : role);
        entity.setStatus(status);
        Instant now = Instant.now();
        entity.setJoinedAt(now);
        entity.setUpdatedAt(now);
        jpa.save(entity);
    }

    /** 중복 참가 여부 */
    public boolean existsActive(Long meetupId, Long userId) {
        return jpa.existsByMeetingIdAndUserIdAndStatusNot(meetupId, userId, "CANCELLED");
    }

    /** 참가자 목록 */
    public List<ParticipantResponse> findParticipants(Long meetupId, boolean excludeCancelled) {
        List<MeetupParticipantEntity> rows = excludeCancelled
                ? jpa.findByMeetingIdAndStatusNot(meetupId, "CANCELLED")
                : jpa.findByMeetingId(meetupId);

        return rows.stream()
                .map(e -> new ParticipantResponse(
                        String.valueOf(e.getUserId()),
                        e.getRole(),
                        e.getStatus(),
                        e.getJoinedAt()
                ))
                .toList();
    }
}
