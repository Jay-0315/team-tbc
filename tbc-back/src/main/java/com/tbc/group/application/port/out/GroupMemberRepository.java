package com.tbc.group.application.port.out;

<<<<<<< HEAD
public interface GroupMemberRepository {
    void addHost(Long groupId, Long userId);

    void addMember(Long groupId, Long userId);

    boolean isMember(Long groupId, Long userId);

    int countActiveMembers(Long groupId);
=======
import java.util.List;

public interface GroupMemberRepository {
    void addHost(Long groupId, Long userId);
    void addMember(Long groupId, Long userId);
    int countActiveMembers(Long groupId);
    boolean existsActiveMember(Long groupId, Long userId);

    // read-side
    record MemberView(Long userId, String role, String status, java.time.LocalDateTime joinedAt) {}
    List<MemberView> findMembers(Long groupId);
    List<MemberView> findMembersByStatus(Long groupId, String status);
>>>>>>> origin/dev
}
