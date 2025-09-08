package com.tbc_back.tbc_back.adapters.out.persistence.jpa;

import com.tbc_back.tbc_back.adapters.out.persistence.entity.MeetupEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataMeetupJpaRepository extends JpaRepository<MeetupEntity, String> { }
