package com.tbc.group.application.facade;

import com.tbc.group.adapterin.http.dto.GroupCreateRequest;

public interface GroupFacade {
    Long createGroup(GroupCreateRequest req, Long hostId);
}