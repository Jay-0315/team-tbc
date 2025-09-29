package com.tbc.profile.adapterin.persistence.jpa.repository;

import com.tbc.profile.adapterin.persistence.jpa.entity.ProfileInterestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProfileInterestJpaRepository extends JpaRepository<ProfileInterestEntity, Long> {
    List<ProfileInterestEntity> findByProfileId(Long profileId);
    void deleteByProfileId(Long profileId);
}
