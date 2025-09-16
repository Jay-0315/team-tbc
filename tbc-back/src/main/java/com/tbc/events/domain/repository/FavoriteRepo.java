package com.tbc.events.domain.repository;

import com.tbc.events.domain.model.Favorite;
import com.tbc.events.domain.model.FavoriteId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FavoriteRepo extends JpaRepository<Favorite, FavoriteId> {
    boolean existsByUserIdAndEventId(Long userId, Long eventId);
    void deleteByUserIdAndEventId(Long userId, Long eventId);
}



