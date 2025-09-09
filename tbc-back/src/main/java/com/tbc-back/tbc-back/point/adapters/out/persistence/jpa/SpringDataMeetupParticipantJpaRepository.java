package com.tbc_back.tbc_back.adapters.out.persistence.jpa;

import com.tbc_back.tbc_back.adapters.out.persistence.entity.MeetupParticipantEntity;
import com.tbc_back.tbc_back.adapters.out.persistence.entity.MeetupParticipantId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpringDataMeetupParticipantJpaRepository
        extends JpaRepository<MeetupParticipantEntity, MeetupParticipantId> {

    // 중복 참가 체크 (status != CANCELLED 인 Row가 있으면 이미 참가한 것으로 간주)
    boolean existsByIdMeetupIdAndIdUserIdAndStatusNot(String meetupId, String userId, String status);

    // 참가자 목록
    List<MeetupParticipantEntity> findByIdMeetupId(String meetupId);
    List<MeetupParticipantEntity> findByIdMeetupIdAndStatusNot(String meetupId, String status);
}
