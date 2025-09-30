package com.tbc.group.application.facade.impl;

<<<<<<< HEAD
=======
import com.tbc.events.domain.model.Favorite;
import com.tbc.events.domain.repository.FavoriteRepo;
>>>>>>> origin/dev
import com.tbc.group.adapterin.http.dto.GroupCardDTO;
import com.tbc.group.application.facade.GroupReadFacade;
import com.tbc.group.application.port.out.ChatRoomOutPort;
import com.tbc.group.application.port.out.GroupRepository;
import com.tbc.group.domain.model.Group;
<<<<<<< HEAD
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

=======
import com.tbc.profile.adapterin.persistence.jpa.entity.ProfileEntity;
import com.tbc.profile.adapterin.persistence.jpa.repository.ProfileJpaRepository;
import com.tbc.login.adapter.out.persistence.UserJpaRepository;
import com.tbc.login.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

>>>>>>> origin/dev
@Component
@RequiredArgsConstructor
public class GroupReadFacadeImpl implements GroupReadFacade {

    private final ChatRoomOutPort chatRoomOutPort;
    private final GroupRepository groupRepository;
<<<<<<< HEAD
=======
    private final ProfileJpaRepository profileRepository;
    private final UserJpaRepository userRepository;
    private final FavoriteRepo favoriteRepo;
>>>>>>> origin/dev

    @Override
    public Long getChatRoomId(Long groupId) {
        return chatRoomOutPort.getRoomIdByGroupId(groupId);
    }

    @Override
    public Page<GroupCardDTO> findAll(Pageable pageable) {
        Page<Group> groups = groupRepository.findAll(pageable);
<<<<<<< HEAD
        return groups.map(GroupCardDTO::from);
=======
        return enrichPageWithHostInfo(groups, pageable, null);
    }

    @Override
    public Page<GroupCardDTO> findAll(Pageable pageable, String searchQuery, String category) {
        Page<Group> groups = groupRepository.findAll(pageable, searchQuery, category);
        return enrichPageWithHostInfo(groups, pageable, null);
    }

    @Override
    public Page<GroupCardDTO> findAll(Pageable pageable, String searchQuery, String category, Long userId) {
        Page<Group> groups = groupRepository.findAll(pageable, searchQuery, category);
        return enrichPageWithHostInfo(groups, pageable, userId);
>>>>>>> origin/dev
    }

    @Override
    public GroupCardDTO findOne(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("group not found: " + groupId));
<<<<<<< HEAD
        return GroupCardDTO.from(group);
=======
        return enrichWithHostInfo(GroupCardDTO.from(group));
    }

    @Override
    public Page<GroupCardDTO> findByUserId(Long userId, Pageable pageable) {
        Page<Group> groups = groupRepository.findByUserId(userId, pageable);
        return enrichPageWithHostInfo(groups, pageable, userId);
    }

    /**
     * N+1 문제 해결: 한번에 모든 호스트 정보와 찜 정보를 조회하여 매핑
     */
    private Page<GroupCardDTO> enrichPageWithHostInfo(Page<Group> groups, Pageable pageable, Long userId) {
        List<GroupCardDTO> dtos = groups.getContent().stream()
                .map(GroupCardDTO::from)
                .collect(Collectors.toList());

        if (dtos.isEmpty()) {
            return new PageImpl<>(dtos, pageable, groups.getTotalElements());
        }

        // 모든 eventId 수집 (찜 정보 조회용)
        List<Long> eventIds = dtos.stream()
                .map(dto -> dto.id)
                .filter(id -> id != null)
                .collect(Collectors.toList());

        // 사용자의 찜 정보 bulk 조회
        java.util.Set<Long> favoritedEventIds = new java.util.HashSet<>();
        if (userId != null && !eventIds.isEmpty()) {
            favoritedEventIds = favoriteRepo.findByUserId(userId).stream()
                    .map(Favorite::getEventId)
                    .collect(Collectors.toSet());
        }

        // 모든 hostId 수집
        List<Long> hostIds = dtos.stream()
                .map(dto -> dto.hostId)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());

        if (!hostIds.isEmpty()) {
            // 프로필 정보 bulk 조회
            Map<Long, ProfileEntity> profileMap = profileRepository.findByUserIdIn(hostIds).stream()
                    .collect(Collectors.toMap(ProfileEntity::getUserId, p -> p));

            // 프로필이 없는 사용자의 User 정보 bulk 조회
            List<Long> missingProfileIds = hostIds.stream()
                    .filter(id -> !profileMap.containsKey(id))
                    .collect(Collectors.toList());

            Map<Long, User> userMap = missingProfileIds.isEmpty() ? Map.of() :
                    userRepository.findByIdIn(missingProfileIds).stream()
                            .collect(Collectors.toMap(User::getId, u -> u));

            // DTO에 호스트 정보 및 찜 정보 매핑
            final java.util.Set<Long> finalFavoritedEventIds = favoritedEventIds;
            dtos.forEach(dto -> {
                // 찜 정보 설정
                if (userId != null && dto.id != null) {
                    dto.favorited = finalFavoritedEventIds.contains(dto.id);
                }
                
                // 호스트 정보 설정
                if (dto.hostId != null) {
                    ProfileEntity profile = profileMap.get(dto.hostId);
                    if (profile != null) {
                        dto.hostNickname = profile.getDisplayName();
                        dto.hostProfileImage = profile.getProfileImageUrl();
                    } else {
                        User user = userMap.get(dto.hostId);
                        if (user != null) {
                            dto.hostNickname = user.getNickname() != null ? user.getNickname() : user.getRealName();
                        }
                    }
                }
            });
        }

        return new PageImpl<>(dtos, pageable, groups.getTotalElements());
    }

    /**
     * 단일 조회용: 기존 방식 유지
     */
    private GroupCardDTO enrichWithHostInfo(GroupCardDTO dto) {
        if (dto.hostId == null) {
            return dto;
        }

        // 프로필 정보 조회
        profileRepository.findByUserId(dto.hostId).ifPresent(profile -> {
            dto.hostNickname = profile.getDisplayName();
            dto.hostProfileImage = profile.getProfileImageUrl();
        });

        // 프로필이 없으면 User 정보에서 닉네임 가져오기
        if (dto.hostNickname == null) {
            userRepository.findById(dto.hostId).ifPresent(user -> {
                dto.hostNickname = user.getNickname() != null ? user.getNickname() : user.getRealName();
            });
        }

        return dto;
>>>>>>> origin/dev
    }
}
