package com.tbc.group.application.port.out;

public interface GroupMemberRepository { void addHost (Long groupId, Long userId);
    int countActiveMembers (Long groupId);
}
