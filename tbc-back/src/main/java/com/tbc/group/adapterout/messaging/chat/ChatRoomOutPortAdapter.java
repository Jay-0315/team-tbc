package com.tbc.group.adapterout.messaging.chat;

import com.tbc.group.application.port.out.ChatRoomOutPort;
import com.tbc.chat.application.facade.ChatFacade; // ← 네 프로젝트의 실제 경로
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChatRoomOutPortAdapter implements ChatRoomOutPort {

    private final ChatFacade chatFacade;

    @Override
    public Long createRoomIfAbsent(Long groupId) {
        // Chat 쪽에 동일 의미의 메서드가 있다면 그걸 호출
        return chatFacade.createRoomIfAbsentByGroup(groupId);
    }

    @Override
    public Long getRoomIdByGroupId(Long groupId) {
        return chatFacade.findRoomIdByGroupId(groupId);
    }

    @Override
    public void addMember(Long roomId, Long userId) {
        chatFacade.addMember(roomId, userId);
    }

    @Override
    public void saveSystemMessage(Long roomId, String content) {
        chatFacade.saveSystemMessage(roomId, content);
    }
}
