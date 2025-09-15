package com.tbc.group.application.facade.impl;

import com.tbc.group.adapterin.http.dto.GroupCreateRequest;
import com.tbc.group.application.facade.GroupFacade;
import com.tbc.group.application.service.GroupCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GroupFacadeImpl implements GroupFacade {

    private final GroupCommandService groupCommandService;

    @Override
    public Long createGroup(GroupCreateRequest req, Long hostId) {
        return groupCommandService.create(req, hostId);
    }
}