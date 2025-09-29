package com.tbc.profile.domain.model;

import java.time.LocalDateTime;
import java.util.List;

public record Profile(
    Long id,
    Long userId,
    String profileImageUrl,
    String displayName,
    Gender gender,
    String bio,
    List<String> interests,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    
    public enum Gender {
        MALE, FEMALE, OTHER
    }
    
    public static Profile create(Long userId, String displayName, Gender gender, String bio, List<String> interests) {
        return new Profile(
            null,
            userId,
            null,
            displayName,
            gender,
            bio,
            interests,
            null,
            null
        );
    }
    
    public Profile withId(Long id) {
        return new Profile(id, userId, profileImageUrl, displayName, gender, bio, interests, createdAt, updatedAt);
    }
    
    public Profile withProfileImageUrl(String profileImageUrl) {
        return new Profile(id, userId, profileImageUrl, displayName, gender, bio, interests, createdAt, updatedAt);
    }
}
