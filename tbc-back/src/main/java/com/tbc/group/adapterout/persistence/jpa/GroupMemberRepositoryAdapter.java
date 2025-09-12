package com.tbc.group.adapterout.persistence.jpa;

import com.tbc.group.adapterout.persistence.jpa.entity.GroupMemberEntity;
import com.tbc.group.adapterout.persistence.jpa.repository.GroupMemberJpaRepository;
import com.tbc.group.application.port.out.GroupMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

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
    public int countActiveMembers(Long groupId) {
        return repo.countByGroupIdAndStatus(groupId, "ACTIVE");
    }
}
