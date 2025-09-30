package com.tbc.group.application.port.out;

public interface GroupMemberRepository {
    void addHost(Long groupId, Long userId);

    void addMember(Long groupId, Long userId);

    boolean isMember(Long groupId, Long userId);

    int countActiveMembers(Long groupId);
}
