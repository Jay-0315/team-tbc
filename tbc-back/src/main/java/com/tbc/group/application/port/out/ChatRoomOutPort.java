package com.tbc.group.application.port.out;

public interface ChatRoomOutPort {
    Long createRoomIfAbsent(Long groupId);
    Long getRoomIdByGroupId(Long groupId);
    void addMember(Long roomId, Long userId);
    void saveSystemMessage (Long roomId, String content);
}