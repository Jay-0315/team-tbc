package com.tbc.group.application.port.out;

import com.tbc.group.domain.model.Group;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
<<<<<<< HEAD
import java.time.LocalDateTime;
import java.util.List;
=======
>>>>>>> origin/dev

public interface GroupRepository {
    Long save(Group group);
    Optional<Group> findById(Long id);
    Page<Group> findAll(Pageable pageable);
<<<<<<< HEAD

    List<Long> findDuePaidGroupIds(LocalDateTime now, int limit);

    void markSettlement(Long groupId, String status);
=======
    Page<Group> findAll(Pageable pageable, String searchQuery, String category);
    Page<Group> findByUserId(Long userId, Pageable pageable);
>>>>>>> origin/dev
}
