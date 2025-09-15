package com.tbc.tbc.adapters.out.persistence.jpa;

import com.tbc.tbc.point.adapters.out.persistence.entity.MeetupParticipantEntity;
import com.tbc.tbc.point.adapters.out.persistence.entity.MeetupParticipantId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SpringDataMeetupParticipantJpaRepository
        extends JpaRepository<MeetupParticipantEntity, MeetupParticipantId> {

    // 중복 참가 체크 (status != CANCELLED 인 Row가 있으면 이미 참가한 것으로 간주)
    boolean existsByIdMeetupIdAndIdUserIdAndStatusNot(Long meetupId, Long userId, String status); // String → Long

    // 참가자 목록
    List<MeetupParticipantEntity> findByIdMeetupId(Long meetupId); // String → Long
    List<MeetupParticipantEntity> findByIdMeetupIdAndStatusNot(Long meetupId, String status); // String → Long
}
