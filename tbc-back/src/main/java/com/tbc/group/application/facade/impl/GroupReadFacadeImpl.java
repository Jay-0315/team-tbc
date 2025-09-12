package com.tbc.group.application.facade.impl;

import com.tbc.group.application.facade.GroupReadFacade;
import com.tbc.group.application.port.out.ChatRoomOutPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GroupReadFacadeImpl implements GroupReadFacade {

    private final ChatRoomOutPort chatRoomOutPort;

    @Override
    public Long getChatRoomId(Long groupId) {
        return chatRoomOutPort.getRoomIdByGroupId(groupId);
    }
}
