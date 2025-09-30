package com.tbc.group.application.port.out;

import com.tbc.group.domain.model.Group;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.time.LocalDateTime;
import java.util.List;

public interface GroupRepository {
    Long save(Group group);
    Optional<Group> findById(Long id);
    Page<Group> findAll(Pageable pageable);

    List<Long> findDuePaidGroupIds(LocalDateTime now, int limit);

    void markSettlement(Long groupId, String status);
}
