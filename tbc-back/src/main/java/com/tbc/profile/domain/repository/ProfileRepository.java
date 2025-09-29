package com.tbc.profile.domain.repository;

import com.tbc.profile.domain.model.Profile;
import java.util.Optional;

public interface ProfileRepository {
    Long save(Profile profile);
    Optional<Profile> findByUserId(Long userId);
    Optional<Profile> findById(Long id);
    void deleteByUserId(Long userId);
}
