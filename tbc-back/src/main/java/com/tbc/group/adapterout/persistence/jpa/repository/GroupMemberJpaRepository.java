package com.tbc.group.adapterout.persistence.jpa.repository;

import com.tbc.group.adapterout.persistence.jpa.entity.GroupMemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
<<<<<<< HEAD
=======
import java.util.List;
>>>>>>> origin/dev

@Repository
public interface GroupMemberJpaRepository extends JpaRepository<GroupMemberEntity, Long> {
    int countByGroupIdAndStatus(Long groupId, String status);
<<<<<<< HEAD

    boolean existsByGroupIdAndUserId(Long groupId, Long userId);
=======
    List<GroupMemberEntity> findByUserIdAndStatus(Long userId, String status);
    List<GroupMemberEntity> findByUserId(Long userId);
    boolean existsByGroupIdAndUserIdAndStatus(Long groupId, Long userId, String status);
    List<GroupMemberEntity> findByGroupId(Long groupId);
    List<GroupMemberEntity> findByGroupIdAndStatus(Long groupId, String status);
>>>>>>> origin/dev
}
