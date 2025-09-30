package com.tbc.profile.adapterin.http.controller;

import com.tbc.common.util.JwtUtils;
import com.tbc.profile.adapterin.http.dto.ProfileResponse;
import com.tbc.profile.adapterin.http.dto.ProfileUpdateRequest;
import com.tbc.profile.adapterin.http.dto.GroupHistoryResponse;
import com.tbc.profile.application.service.ProfileService;
import com.tbc.profile.application.service.GroupHistoryService;
import com.tbc.profile.domain.model.Profile;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private static final Logger log = LoggerFactory.getLogger(ProfileController.class);

    private final ProfileService profileService;
    private final GroupHistoryService groupHistoryService;
    private final JwtUtils jwtUtils;

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getMyProfile(HttpServletRequest request) {
        Long userId = jwtUtils.getUserIdFromRequest(request);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<Profile> profile = profileService.findByUserId(userId);
        if (profile.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(ProfileResponse.from(profile.get()));
    }

    @PutMapping("/me")
    public ResponseEntity<ProfileResponse> updateMyProfile(
            @RequestBody ProfileUpdateRequest request,
            HttpServletRequest httpRequest) {
        Long userId = jwtUtils.getUserIdFromRequest(httpRequest);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Debug logging: check incoming image length
        try {
            String img = request.profileImageUrl();
            if (img != null) {
                System.out.println("[ProfileController] Received profileImageUrl length=" + img.length());
            } else {
                System.out.println("[ProfileController] Received profileImageUrl is null");
            }
        } catch (Exception ignored) {}

        Profile.Gender gender = null;
        if (request.gender() != null && !request.gender().isEmpty()) {
            try {
                gender = Profile.Gender.valueOf(request.gender().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }

        Profile updatedProfile = profileService.createOrUpdateProfile(
            userId,
            request.displayName(),
            gender,
            request.bio(),
            request.interests(),
            request.profileImageUrl()
        );

        return ResponseEntity.ok(ProfileResponse.from(updatedProfile));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ProfileResponse> getUserProfile(@PathVariable Long userId) {
        Optional<Profile> profile = profileService.findByUserId(userId);
        if (profile.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(ProfileResponse.from(profile.get()));
    }

    @GetMapping("/me/groups/current")
    public ResponseEntity<List<GroupHistoryResponse>> getCurrentGroups(HttpServletRequest request) {
        Long userId = jwtUtils.getUserIdFromRequest(request);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<GroupHistoryResponse> groups = groupHistoryService.getCurrentGroups(userId);
        log.info("[ProfileController] current groups size={}, userId={}", groups.size(), userId);
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/me/groups/past")
    public ResponseEntity<List<GroupHistoryResponse>> getPastGroups(HttpServletRequest request) {
        Long userId = jwtUtils.getUserIdFromRequest(request);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<GroupHistoryResponse> groups = groupHistoryService.getPastGroups(userId);
        log.info("[ProfileController] past groups size={}, userId={}", groups.size(), userId);
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/me/groups/created")
    public ResponseEntity<List<GroupHistoryResponse>> getCreatedGroups(HttpServletRequest request) {
        Long userId = jwtUtils.getUserIdFromRequest(request);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<GroupHistoryResponse> groups = groupHistoryService.getCreatedGroups(userId);
        log.info("[ProfileController] created groups size={}, userId={}", groups.size(), userId);
        return ResponseEntity.ok(groups);
    }
}
