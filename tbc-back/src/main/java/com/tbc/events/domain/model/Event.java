package com.tbc.events.domain.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

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

    @Column(name = "cover_url", nullable = false)
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

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(nullable = false, length = 200)
    private String location;

    @Column(name = "event_date")
    private LocalDate eventDate;

    @Column(name = "event_time")
    private LocalTime eventTime;

    @Lob
    private String description;

    // 추가 필드: 결제/콘텐츠/호스트 정보 (DB 컬럼 존재 가정)
    @Column(name = "fee_amount")
    private Integer feeAmount;

    @Column(name = "fee_type", length = 20)
    private String feeType;

    @Lob
    @Column(name = "content_html")
    private String contentHtml;

    @Column(name = "host_id")
    private Long hostId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
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
    public LocalDate getEventDate() { return eventDate; }
    public LocalTime getEventTime() { return eventTime; }
    public String getDescription() { return description; }
    public Integer getFeeAmount() { return feeAmount; }
    public String getFeeType() { return feeType; }
    public String getContentHtml() { return contentHtml; }
    public Long getHostId() { return hostId; }
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
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }
    public void setEventTime(LocalTime eventTime) { this.eventTime = eventTime; }
    public void setDescription(String description) { this.description = description; }
    public void setFeeAmount(Integer feeAmount) { this.feeAmount = feeAmount; }
    public void setFeeType(String feeType) { this.feeType = feeType; }
    public void setContentHtml(String contentHtml) { this.contentHtml = contentHtml; }
    public void setHostId(Long hostId) { this.hostId = hostId; }
}



