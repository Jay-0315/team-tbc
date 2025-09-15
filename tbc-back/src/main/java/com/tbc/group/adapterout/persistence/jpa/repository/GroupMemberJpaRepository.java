package com.tbc.group.adapterout.persistence.jpa.repository;

import com.tbc.group.adapterout.persistence.jpa.entity.GroupMemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupMemberJpaRepository extends JpaRepository<GroupMemberEntity, Long> {
    int countByGroupIdAndStatus(Long groupId, String status);
}
