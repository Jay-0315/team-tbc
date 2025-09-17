package com.tbc.tbc.point.adapters.out.persistence.jpa;

import com.tbc.tbc.point.adapters.out.persistence.entity.MeetupParticipantEntity;
import com.tbc.tbc.point.adapters.out.persistence.entity.MeetupParticipantId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SpringDataMeetupParticipantJpaRepository
        extends JpaRepository<MeetupParticipantEntity, Long> {

    // 중복 참가 체크 (status != CANCELLED 인 Row가 있으면 이미 참가한 것으로 간주)
    boolean existsByMeetingIdAndUserIdAndStatusNot(Long meetingId, Long userId, String status);

    // 참가자 목록
    List<MeetupParticipantEntity> findByMeetingId(Long meetingId);
    List<MeetupParticipantEntity> findByMeetingIdAndStatusNot(Long meetingId, String status);
}
