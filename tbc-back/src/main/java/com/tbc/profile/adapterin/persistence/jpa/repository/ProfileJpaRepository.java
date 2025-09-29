package com.tbc.profile.adapterin.persistence.jpa.repository;

import com.tbc.profile.adapterin.persistence.jpa.entity.ProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProfileJpaRepository extends JpaRepository<ProfileEntity, Long> {
    Optional<ProfileEntity> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
