package com.tbc_back.tbc_back.mypage.adapters.out.persistence.jpa;

import com.tbc_back.tbc_back.adapters.out.persistence.entity.MeetupParticipantEntity;
import com.tbc_back.tbc_back.adapters.out.persistence.entity.MeetupParticipantId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MyPageMeetupParticipantRepository
        extends JpaRepository<MeetupParticipantEntity, MeetupParticipantId> {

    // 참가자 + 모임(MeetupEntity) 같이 불러오기 (N+1 방지)
    @EntityGraph(attributePaths = {"meetup"})
    Page<MeetupParticipantEntity> findByIdUserIdOrderByJoinedAtDesc(String userId, Pageable pageable);
}
