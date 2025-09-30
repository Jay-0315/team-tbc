package com.tbc.profile.adapterin.http.dto;

import java.util.List;

public record ProfileUpdateRequest(
    String displayName,
    String gender,
    String bio,
    List<String> interests,
    String profileImageUrl
) {}
