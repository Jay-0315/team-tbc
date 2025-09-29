package com.tbc.profile.adapterin.persistence.jpa;

import com.tbc.profile.adapterin.persistence.jpa.entity.ProfileEntity;
import com.tbc.profile.adapterin.persistence.jpa.entity.ProfileInterestEntity;
import com.tbc.profile.adapterin.persistence.jpa.repository.ProfileJpaRepository;
import com.tbc.profile.adapterin.persistence.jpa.repository.ProfileInterestJpaRepository;
import com.tbc.profile.domain.model.Profile;
import com.tbc.profile.domain.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ProfileRepositoryAdapter implements ProfileRepository {
    
    private final ProfileJpaRepository profileRepo;
    private final ProfileInterestJpaRepository interestRepo;
    
    @Override
    public Long save(Profile profile) {
        ProfileEntity entity = ProfileEntity.builder()
            .id(profile.id())
            .userId(profile.userId())
            .profileImageUrl(profile.profileImageUrl())
            .displayName(profile.displayName())
            .gender(profile.gender() != null ? 
                ProfileEntity.Gender.valueOf(profile.gender().name()) : null)
            .bio(profile.bio())
            .build();
        
        ProfileEntity saved = profileRepo.save(entity);
        
        // 기존 관심사 삭제
        if (profile.id() != null) {
            interestRepo.deleteByProfileId(profile.id());
        }
        
        // 새로운 관심사 저장
        if (profile.interests() != null && !profile.interests().isEmpty()) {
            List<ProfileInterestEntity> interests = profile.interests().stream()
                .map(interest -> ProfileInterestEntity.builder()
                    .profileId(saved.getId())
                    .interest(interest)
                    .build())
                .toList();
            interestRepo.saveAll(interests);
        }
        
        return saved.getId();
    }
    
    @Override
    public Optional<Profile> findByUserId(Long userId) {
        return profileRepo.findByUserId(userId)
            .map(this::toDomain);
    }
    
    @Override
    public Optional<Profile> findById(Long id) {
        return profileRepo.findById(id)
            .map(this::toDomain);
    }
    
    @Override
    public void deleteByUserId(Long userId) {
        profileRepo.findByUserId(userId)
            .ifPresent(profile -> {
                interestRepo.deleteByProfileId(profile.getId());
                profileRepo.deleteByUserId(userId);
            });
    }
    
    private Profile toDomain(ProfileEntity entity) {
        List<String> interests = interestRepo.findByProfileId(entity.getId())
            .stream()
            .map(ProfileInterestEntity::getInterest)
            .toList();
        
        return new Profile(
            entity.getId(),
            entity.getUserId(),
            entity.getProfileImageUrl(),
            entity.getDisplayName(),
            entity.getGender() != null ? 
                Profile.Gender.valueOf(entity.getGender().name()) : null,
            entity.getBio(),
            interests,
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
