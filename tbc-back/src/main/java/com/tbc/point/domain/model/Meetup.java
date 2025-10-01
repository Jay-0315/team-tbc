package com.tbc.point.domain.model;


import java.time.LocalDateTime;

public class Meetup {
    private final Long id;
    private final Long hostId;
    private final String title;
    private final String topic;
    private final String category;
    private final Integer feeAmount;
    private final String feeType;
    private final Integer capacity;
    private final Integer maxParticipants;
    private final Integer minParticipants;
    private final Integer joined;
    private final String status;
    private final String mode;
    private final String location;
    private final String coverUrl;
    private final String description;
    private final String feeInfo;
    private final String tagsCsv;
    private final String contentHtml;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public Meetup(Long id,
                  Long hostId,
                  String title,
                  String topic,
                  String category,
                  Integer feeAmount,
                  String feeType,
                  Integer capacity,
                  Integer maxParticipants,
                  Integer minParticipants,
                  Integer joined,
                  String status,
                  String mode,
                  String location,
                  String coverUrl,
                  String description,
                  String feeInfo,
                  String tagsCsv,
                  String contentHtml,
                  LocalDateTime createdAt,
                  LocalDateTime updatedAt) {
        this.id = id;
        this.hostId = hostId;
        this.title = title;
        this.topic = topic;
        this.category = category;
        this.feeAmount = feeAmount;
        this.feeType = feeType;
        this.capacity = capacity;
        this.maxParticipants = maxParticipants;
        this.minParticipants = minParticipants;
        this.joined = joined;
        this.status = status;
        this.mode = mode;
        this.location = location;
        this.coverUrl = coverUrl;
        this.description = description;
        this.feeInfo = feeInfo;
        this.tagsCsv = tagsCsv;
        this.contentHtml = contentHtml;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getHostId() {
        return hostId;
    }

    public String getTitle() {
        return title;
    }

    public String getTopic() {
        return topic;
    }

    public String getCategory() {
        return category;
    }

    public Integer getFeeAmount() {
        return feeAmount;
    }

    public String getFeeType() {
        return feeType;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public Integer getMaxParticipants() {
        return maxParticipants;
    }

    public Integer getMinParticipants() {
        return minParticipants;
    }

    public Integer getJoined() {
        return joined;
    }

    public String getStatus() {
        return status;
    }

    public String getMode() {
        return mode;
    }

    public String getLocation() {
        return location;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    public String getDescription() {
        return description;
    }

    public String getFeeInfo() {
        return feeInfo;
    }

    public String getTagsCsv() {
        return tagsCsv;
    }

    public String getContentHtml() {
        return contentHtml;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public int getParticipationCost() {
        return feeAmount == null ? 0 : feeAmount;
    }

    public boolean isJoinableStatus() {
        return "OPEN".equalsIgnoreCase(status) || "UPCOMING".equalsIgnoreCase(status);
    }

    public boolean hasCapacityLeft() {
        if (capacity == null) {
            return true;
        }
        int joinedCount = joined == null ? 0 : joined;
        return joinedCount < capacity;
    }
}
