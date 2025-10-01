package com.tbc.point.adapters.out.persistence.jpa;

import com.tbc.point.adapters.out.persistence.entity.MeetupEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface SpringDataMeetupJpaRepository extends JpaRepository<MeetupEntity, Long> {

    // 내가 진행한 모임 (hostId 기준으로 조회, 최신순)
    List<MeetupEntity> findByStatusOrderByCreatedAtDesc(String status);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update MeetupEntity m set m.joined = m.joined + 1 where m.id = :id")
    int incrementJoined(@Param("id") Long id);
}
