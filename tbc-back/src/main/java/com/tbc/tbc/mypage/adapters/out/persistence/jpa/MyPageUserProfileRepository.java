package com.tbc.tbc.mypage.adapters.out.persistence.jpa;

import com.tbc.tbc.mypage.adapters.out.persistence.entity.UserProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MyPageUserProfileRepository extends JpaRepository<UserProfileEntity, Long> {
    Optional<UserProfileEntity> findByUserId(Long userId);
}


