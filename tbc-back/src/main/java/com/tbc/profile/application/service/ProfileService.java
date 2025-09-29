package com.tbc.profile.application.service;

import com.tbc.profile.application.port.out.ProfileRepository;
import com.tbc.profile.domain.model.Profile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;

    @Transactional
    public Profile createOrUpdateProfile(Long userId, String displayName,
                                         Profile.Gender gender, String bio,
                                         List<String> interests,
                                         String profileImageUrl) {
        Optional<Profile> existingProfile = profileRepository.findByUserId(userId);

        Profile profileToSave;
        if (existingProfile.isPresent()) {
            Profile p = existingProfile.get();
            String nextImage = (profileImageUrl != null && !profileImageUrl.isBlank())
                    ? profileImageUrl
                    : p.profileImageUrl();
            profileToSave = new Profile(
                    p.id(),
                    userId,
                    nextImage,
                    displayName,
                    gender,
                    bio,
                    interests,
                    p.createdAt(),
                    LocalDateTime.now()
            );
        } else {
            profileToSave = Profile.create(userId, displayName, gender, bio, interests);
            if (profileImageUrl != null && !profileImageUrl.isBlank()) {
                profileToSave = profileToSave.withProfileImageUrl(profileImageUrl);
            }
        }

        Long savedId = profileRepository.save(profileToSave);
        return profileToSave.withId(savedId);
    }

    @Transactional(readOnly = true)
    public Optional<Profile> findByUserId(Long userId) {
        return profileRepository.findByUserId(userId);
    }

    @Transactional
    public void deleteProfile(Long userId) {
        profileRepository.deleteByUserId(userId);
    }
}
