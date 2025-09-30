package com.tbc.group.adapterout.persistence.jpa.repository;

import com.tbc.group.adapterout.persistence.jpa.entity.GroupEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupJpaRepository extends JpaRepository<GroupEntity, Long> {
    @Query("select g.id from GroupEntity g where g.feeType = 'PAID' and (g.settlementStatus is null or g.settlementStatus = 'PENDING') and g.startAt is not null and g.startAt <= :now order by g.startAt asc")
    java.util.List<Long> findDuePaidGroupIds(@Param("now") java.time.LocalDateTime now, org.springframework.data.domain.Pageable pageable);
}
