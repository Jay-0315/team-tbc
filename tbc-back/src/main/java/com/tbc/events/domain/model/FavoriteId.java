package com.tbc.events.domain.model;

import java.io.Serializable;
import java.util.Objects;

public class FavoriteId implements Serializable {
    private Long userId;
    private Long eventId;

    public FavoriteId() {}

    public FavoriteId(Long userId, Long eventId) {
        this.userId = userId;
        this.eventId = eventId;
    }

    public Long getUserId() { return userId; }
    public Long getEventId() { return eventId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FavoriteId that = (FavoriteId) o;
        return Objects.equals(userId, that.userId) && Objects.equals(eventId, that.eventId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, eventId);
    }
}



