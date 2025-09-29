package com.tbc.profile.adapterin.http.dto;

import com.tbc.profile.domain.model.Profile;
import java.time.LocalDateTime;
import java.util.List;

public record ProfileResponse(
    Long id,
    Long userId,
    String profileImageUrl,
    String displayName,
    String gender,
    String bio,
    List<String> interests,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static ProfileResponse from(Profile profile) {
        return new ProfileResponse(
            profile.id(),
            profile.userId(),
            profile.profileImageUrl(),
            profile.displayName(),
            profile.gender() != null ? profile.gender().name() : null,
            profile.bio(),
            profile.interests(),
            profile.createdAt(),
            profile.updatedAt()
        );
    }
}
