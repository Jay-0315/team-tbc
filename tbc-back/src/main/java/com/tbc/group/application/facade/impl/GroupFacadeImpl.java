package com.tbc.group.application.facade.impl;

import com.tbc.group.adapterin.http.dto.GroupCreateRequest;
import com.tbc.group.application.facade.GroupFacade;
import com.tbc.group.application.service.GroupCommandService;
import com.tbc.group.application.service.PaidJoinService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GroupFacadeImpl implements GroupFacade {

    private final GroupCommandService groupCommandService;
    private final PaidJoinService paidJoinService;

    @Override
    public Long createGroup(GroupCreateRequest req, Long hostId) {
        return groupCommandService.create(req, hostId);
    }

    @Override
    public void joinGroup(Long groupId, Long userId) {
        paidJoinService.joinWithWalletHold(groupId, userId);
    }
}