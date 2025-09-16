package com.tbc.tbc.point.adapters.out.persistence.jpa;

import com.tbc.tbc.point.adapters.out.persistence.entity.MeetupEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SpringDataMeetupJpaRepository extends JpaRepository<MeetupEntity, Long> { // String → Long

    // 내가 진행한 모임 (hostId 기준으로 조회, 최신순)
    Page<MeetupEntity> findByHostIdOrderByStartAtDesc(Long hostId, Pageable pageable); // String → Long

    // 열린 모임 조회 (status = 'OPEN')
    List<MeetupEntity> findByStatus(String status);
}
