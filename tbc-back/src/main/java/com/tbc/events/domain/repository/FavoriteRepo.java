package com.tbc.events.domain.repository;

import com.tbc.events.domain.model.Favorite;
import com.tbc.events.domain.model.FavoriteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FavoriteRepo extends JpaRepository<Favorite, FavoriteId> {
    boolean existsByUserIdAndEventId(Long userId, Long eventId);
    
    @Modifying
    @Query("DELETE FROM Favorite f WHERE f.userId = :userId AND f.eventId = :eventId")
    void deleteByUserIdAndEventId(@Param("userId") Long userId, @Param("eventId") Long eventId);
    
    List<Favorite> findByUserId(Long userId);
}



