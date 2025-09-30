package com.tbc.events.domain.model;

import com.tbc.group.adapterout.persistence.jpa.entity.GroupEntity;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "event_reviews", indexes = {
        @Index(name = "idx_event_reviews_event_created", columnList = "event_id, created_at DESC")
})
public class EventReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private GroupEntity event;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Integer rating;

    @Column(nullable = false, length = 500)
    private String comment;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public GroupEntity getEvent() { return event; }
    public Long getUserId() { return userId; }
    public Integer getRating() { return rating; }
    public String getComment() { return comment; }
    public Instant getCreatedAt() { return createdAt; }

    public void setEvent(GroupEntity event) { this.event = event; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setRating(Integer rating) { this.rating = rating; }
    public void setComment(String comment) { this.comment = comment; }
}
