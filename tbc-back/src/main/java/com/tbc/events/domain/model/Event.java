package com.tbc.events.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "events", indexes = {
        @Index(name = "idx_events_status_category_start_created", 
               columnList = "status, category, start_at, created_at"),
        @Index(name = "idx_events_title", 
               columnList = "title")
})
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false)
    private String coverUrl;

    @Column(nullable = false, length = 50)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EventStatus status;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private Integer joined;

    @Column(nullable = false)
    private LocalDateTime startAt;

    @Column(nullable = false, length = 200)
    private String location;

    @Lob
    private String description;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.joined == null) this.joined = 0;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getCoverUrl() { return coverUrl; }
    public String getCategory() { return category; }
    public EventStatus getStatus() { return status; }
    public Integer getCapacity() { return capacity; }
    public Integer getJoined() { return joined; }
    public LocalDateTime getStartAt() { return startAt; }
    public String getLocation() { return location; }
    public String getDescription() { return description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setTitle(String title) { this.title = title; }
    public void setCoverUrl(String coverUrl) { this.coverUrl = coverUrl; }
    public void setCategory(String category) { this.category = category; }
    public void setStatus(EventStatus status) { this.status = status; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public void setJoined(Integer joined) { this.joined = joined; }
    public void setStartAt(LocalDateTime startAt) { this.startAt = startAt; }
    public void setLocation(String location) { this.location = location; }
    public void setDescription(String description) { this.description = description; }
}



