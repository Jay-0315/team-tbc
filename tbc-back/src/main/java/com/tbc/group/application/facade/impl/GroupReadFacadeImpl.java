package com.tbc.group.application.facade.impl;

import com.tbc.group.adapterin.http.dto.GroupCardDTO;
import com.tbc.group.application.facade.GroupReadFacade;
import com.tbc.group.application.port.out.ChatRoomOutPort;
import com.tbc.group.application.port.out.GroupRepository;
import com.tbc.group.domain.model.Group;
import com.tbc.profile.adapterin.persistence.jpa.repository.ProfileJpaRepository;
import com.tbc.login.adapter.out.persistence.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GroupReadFacadeImpl implements GroupReadFacade {

    private final ChatRoomOutPort chatRoomOutPort;
    private final GroupRepository groupRepository;
    private final ProfileJpaRepository profileRepository;
    private final UserJpaRepository userRepository;

    @Override
    public Long getChatRoomId(Long groupId) {
        return chatRoomOutPort.getRoomIdByGroupId(groupId);
    }

    @Override
    public Page<GroupCardDTO> findAll(Pageable pageable) {
        Page<Group> groups = groupRepository.findAll(pageable);
        return groups.map(group -> enrichWithHostInfo(GroupCardDTO.from(group)));
    }

    @Override
    public Page<GroupCardDTO> findAll(Pageable pageable, String searchQuery, String category) {
        Page<Group> groups = groupRepository.findAll(pageable, searchQuery, category);
        return groups.map(group -> enrichWithHostInfo(GroupCardDTO.from(group)));
    }

    @Override
    public GroupCardDTO findOne(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("group not found: " + groupId));
        return enrichWithHostInfo(GroupCardDTO.from(group));
    }

    @Override
    public Page<GroupCardDTO> findByUserId(Long userId, Pageable pageable) {
        Page<Group> groups = groupRepository.findByUserId(userId, pageable);
        return groups.map(group -> enrichWithHostInfo(GroupCardDTO.from(group)));
    }

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
    }
}
