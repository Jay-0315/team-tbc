package com.tbc.group.application.port.in;
import com.tbc.group.adapterin.http.dto.GroupCreateRequest;

public interface CreateGroupUseCase { Long create (GroupCreateRequest req, Long hostId); }
