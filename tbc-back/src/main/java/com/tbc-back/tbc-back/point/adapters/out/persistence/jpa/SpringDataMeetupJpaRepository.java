package com.tbc_back.tbc_back.adapters.out.persistence.jpa;

import com.tbc_back.tbc_back.adapters.out.persistence.entity.MeetupEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataMeetupJpaRepository extends JpaRepository<MeetupEntity, String> {

    // 내가 진행한 모임 (hostId 기준으로 조회, 최신순)
    Page<MeetupEntity> findByHostIdOrderByStartAtDesc(String hostId, Pageable pageable);
}