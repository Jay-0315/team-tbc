package com.tbc.group.adapterout.persistence.jpa.repository;

import com.tbc.group.adapterout.persistence.jpa.entity.GroupEntity;
<<<<<<< HEAD
=======
import com.tbc.events.web.dto.EventCardDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
>>>>>>> origin/dev
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
<<<<<<< HEAD

@Repository
public interface GroupJpaRepository extends JpaRepository<GroupEntity, Long> {
    @Query("select g.id from GroupEntity g where g.feeType = 'PAID' and (g.settlementStatus is null or g.settlementStatus = 'PENDING') and g.startAt is not null and g.startAt <= :now order by g.startAt asc")
    java.util.List<Long> findDuePaidGroupIds(@Param("now") java.time.LocalDateTime now, org.springframework.data.domain.Pageable pageable);
=======
import java.util.List;

@Repository
public interface GroupJpaRepository extends JpaRepository<GroupEntity, Long> {
    
    @Query("SELECT g FROM GroupEntity g WHERE " +
           "(:searchQuery IS NULL OR LOWER(g.title) LIKE LOWER(CONCAT('%', :searchQuery, '%'))) AND " +
           "(:category IS NULL OR g.category = :category)")
    Page<GroupEntity> findAll(Pageable pageable, 
                             @Param("searchQuery") String searchQuery, 
                             @Param("category") String category);

    @Query("SELECT g FROM GroupEntity g " +
           "INNER JOIN GroupMemberEntity gm ON g.id = gm.groupId " +
           "WHERE gm.userId = :userId AND gm.status = 'ACTIVE'")
    Page<GroupEntity> findByUserId(@Param("userId") Long userId, Pageable pageable);
    
    List<GroupEntity> findByHostId(Long hostId);
    
>>>>>>> origin/dev
}
