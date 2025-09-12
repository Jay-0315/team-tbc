package com.tbc.group.adapterout.messaging.spring;

import com.tbc.group.application.port.out.ChatRoomOutPort;
import com.tbc.group.domain.event.GroupCreatedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;
import com.tbc.group.domain.event.UserJoinedGroupEvent;



@Component @RequiredArgsConstructor
public class GroupChatBridge {
    private final ChatRoomOutPort chat;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onGroupCreated(GroupCreatedEvent e) {
        Long roomId = chat.createRoomIfAbsent(e.groupId());
        chat.addMember(roomId, e.hostId());
        chat.saveSystemMessage(roomId, "채팅방이 생성되었습니다. 호스트가 입장했습니다.");
    }
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onUserJoined(UserJoinedGroupEvent e) {
        Long roomId = chat.getRoomIdByGroupId(e.groupId());
        chat.addMember(roomId, e.userId());
        chat.saveSystemMessage(roomId, "유저(" + e.userId() + ")가 입장했습니다.");
    }
}