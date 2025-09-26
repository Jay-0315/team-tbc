package com.tbc.group.application.facade;

import com.tbc.group.adapterin.http.dto.GroupCardDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface GroupReadFacade {
    Long getChatRoomId(Long groupId);
    Page<GroupCardDTO> findAll(Pageable pageable);
    Page<GroupCardDTO> findAll(Pageable pageable, String searchQuery, String category);
    GroupCardDTO findOne(Long groupId);
}
