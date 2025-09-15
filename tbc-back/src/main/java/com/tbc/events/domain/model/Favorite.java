package com.tbc.events.domain.model;

import jakarta.persistence.*;

@Entity
@Table(name = "event_favorites")
@IdClass(FavoriteId.class)
public class Favorite {
    @Id
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Id
    @Column(name = "event_id", nullable = false)
    private Long eventId;

    protected Favorite() {}

    public Favorite(Long userId, Long eventId) {
        this.userId = userId;
        this.eventId = eventId;
    }

    public Long getUserId() { return userId; }
    public Long getEventId() { return eventId; }
}



