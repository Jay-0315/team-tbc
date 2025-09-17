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
    Page<MeetupParticipantEntity> findByUserIdOrderByJoinedAtDesc(Long userId, Pageable pageable);

    // 참여 중(진행 중/오픈): 참가자 status != CANCELLED AND (meetup.status='OPEN' OR meetup.endAt > now)
    @EntityGraph(attributePaths = {"meetup"})
    @Query("select mp from MeetupParticipantEntity mp join mp.meetup m " +
            "where mp.userId=:uid and mp.status <> 'CANCELLED' and (m.status='OPEN' or m.endAt > CURRENT_TIMESTAMP) " +
            "order by mp.joinedAt desc")
    Page<MeetupParticipantEntity> findActiveByUser(@Param("uid") Long userId, Pageable pageable);

    // 참여 종료: endAt <= now or meetup status in CLOSED/FINISHED/CANCELLED
    @EntityGraph(attributePaths = {"meetup"})
    @Query("select mp from MeetupParticipantEntity mp join mp.meetup m " +
            "where mp.userId=:uid and (m.endAt <= CURRENT_TIMESTAMP or m.status in ('CLOSED','FINISHED','CANCELLED')) " +
            "order by mp.joinedAt desc")
    Page<MeetupParticipantEntity> findEndedByUser(@Param("uid") Long userId, Pageable pageable);
}
