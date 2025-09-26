package com.tbc.group.application.facade.impl;

import com.tbc.group.adapterin.http.dto.GroupCardDTO;
import com.tbc.group.application.facade.GroupReadFacade;
import com.tbc.group.application.port.out.ChatRoomOutPort;
import com.tbc.group.application.port.out.GroupRepository;
import com.tbc.group.domain.model.Group;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GroupReadFacadeImpl implements GroupReadFacade {

    private final ChatRoomOutPort chatRoomOutPort;
    private final GroupRepository groupRepository;

    @Override
    public Long getChatRoomId(Long groupId) {
        return chatRoomOutPort.getRoomIdByGroupId(groupId);
    }

    @Override
    public Page<GroupCardDTO> findAll(Pageable pageable) {
        Page<Group> groups = groupRepository.findAll(pageable);
        return groups.map(GroupCardDTO::from);
    }

    @Override
    public Page<GroupCardDTO> findAll(Pageable pageable, String searchQuery, String category) {
        Page<Group> groups = groupRepository.findAll(pageable, searchQuery, category);
        return groups.map(GroupCardDTO::from);
    }

    @Override
    public GroupCardDTO findOne(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("group not found: " + groupId));
        return GroupCardDTO.from(group);
    }
}
