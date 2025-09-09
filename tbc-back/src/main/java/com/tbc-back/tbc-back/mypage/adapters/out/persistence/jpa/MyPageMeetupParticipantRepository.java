package com.tbc_back.tbc_back.mypage.adapters.out.persistence.jpa;

import com.tbc_back.tbc_back.adapters.out.persistence.entity.MeetupParticipantEntity;
import com.tbc_back.tbc_back.adapters.out.persistence.entity.MeetupParticipantId;
import com.tbc_back.tbc_back.mypage.adapters.out.persistence.jpa.projections.MyMeetupItemView;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MyPageMeetupParticipantRepository
        extends JpaRepository<MeetupParticipantEntity, MeetupParticipantId> {

    // id.userId 경로로 유도 쿼리 생성 + JOIN 해서 meetup 필드까지 자동 로드
    Page<MyMeetupItemView> findByIdUserIdOrderByJoinedAtDesc(String userId, Pageable pageable);
}
