// Meetup Participant Repository
package com.tbc.tbc.mypage.adapters.out.persistence.jpa;

import com.tbc.tbc.point.adapters.out.persistence.entity.MeetupParticipantEntity;
import com.tbc.tbc.point.adapters.out.persistence.entity.MeetupParticipantId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MyPageMeetupParticipantRepository
        extends JpaRepository<MeetupParticipantEntity, Long> {

    // 참가자 + 모임(MeetupEntity) 같이 불러오기 (N+1 방지)
    @EntityGraph(attributePaths = {"meetup"})
    Page<MeetupParticipantEntity> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    // 참여 중: 참가자 status != CANCELLED AND meetup.status='OPEN'
    @EntityGraph(attributePaths = {"meetup"})
    @Query("select mp from MeetupParticipantEntity mp join mp.meetup m " +
            "where mp.userId=:uid and mp.status <> 'CANCELLED' and m.status='OPEN' " +
            "order by mp.createdAt desc")
    Page<MeetupParticipantEntity> findActiveByUser(@Param("uid") Long userId, Pageable pageable);

    // 참여 종료: meetup.status='FINISHED' (요청 사양)
    @EntityGraph(attributePaths = {"meetup"})
    @Query("select mp from MeetupParticipantEntity mp join mp.meetup m " +
            "where mp.userId=:uid and m.status = 'FINISHED' " +
            "order by mp.createdAt desc")
    Page<MeetupParticipantEntity> findEndedByUser(@Param("uid") Long userId, Pageable pageable);
}
