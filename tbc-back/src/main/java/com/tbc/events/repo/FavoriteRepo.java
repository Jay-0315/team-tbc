package com.tbc.events.repo;

import com.tbc.events.domain.Favorite;
import com.tbc.events.domain.FavoriteId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FavoriteRepo extends JpaRepository<Favorite, FavoriteId> {
    boolean existsByUserIdAndEventId(Long userId, Long eventId);
    void deleteByUserIdAndEventId(Long userId, Long eventId);
}