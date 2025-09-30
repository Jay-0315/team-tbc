package com.tbc.group.adapterout.persistence.jpa;

import com.tbc.group.adapterout.persistence.jpa.entity.GroupMemberEntity;
import com.tbc.group.adapterout.persistence.jpa.repository.GroupMemberJpaRepository;
import com.tbc.group.application.port.out.GroupMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class GroupMemberRepositoryAdapter implements GroupMemberRepository {

    private final GroupMemberJpaRepository repo;

    @Override
    public void addHost(Long groupId, Long userId) {
        // 멱등 처리: 유니크키 기반 (group_id + user_id)
        repo.save(GroupMemberEntity.builder()
                .groupId(groupId)
                .userId(userId)
                .role("HOST")
                .status("ACTIVE")
                .build());
    }

    @Override
    public void addMember(Long groupId, Long userId) {
        // 이미 ACTIVE면 무시(멱등)
        if (repo.existsByGroupIdAndUserIdAndStatus(groupId, userId, "ACTIVE")) return;
        repo.save(GroupMemberEntity.builder()
                .groupId(groupId)
                .userId(userId)
                .role("MEMBER")
                .status("ACTIVE")
                .build());
    }

    @Override
    public int countActiveMembers(Long groupId) {
        return repo.countByGroupIdAndStatus(groupId, "ACTIVE");
    }

    @Override
    public boolean existsActiveMember(Long groupId, Long userId) {
        return repo.existsByGroupIdAndUserIdAndStatus(groupId, userId, "ACTIVE");
    }

    @Override
    public List<MemberView> findMembers(Long groupId) {
        return repo.findByGroupId(groupId).stream()
                .map(e -> new MemberView(e.getUserId(), e.getRole(), e.getStatus(), e.getJoinedAt()))
                .collect(Collectors.toList());
    }

    @Override
    public List<MemberView> findMembersByStatus(Long groupId, String status) {
        return repo.findByGroupIdAndStatus(groupId, status).stream()
                .map(e -> new MemberView(e.getUserId(), e.getRole(), e.getStatus(), e.getJoinedAt()))
                .collect(Collectors.toList());
    }
}
