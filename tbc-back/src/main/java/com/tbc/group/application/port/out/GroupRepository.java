package com.tbc.group.application.port.out;

import com.tbc.group.domain.model.Group;
import java.util.Optional;

public interface GroupRepository {
    Long save(Group group);
    Optional<Group> findById(Long id);
}