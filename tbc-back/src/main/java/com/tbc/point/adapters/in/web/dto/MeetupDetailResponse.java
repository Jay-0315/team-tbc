package com.tbc.point.adapters.in.web.dto;

import com.tbc.point.domain.model.Meetup;

import java.time.LocalDateTime;

public record MeetupDetailResponse(
        Long id,
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
        LocalDateTime updatedAt
) {
    public static MeetupDetailResponse from(Meetup meetup) {
        return new MeetupDetailResponse(
                meetup.getId(),
                meetup.getHostId(),
                meetup.getTitle(),
                meetup.getTopic(),
                meetup.getCategory(),
                meetup.getFeeAmount(),
                meetup.getFeeType(),
                meetup.getCapacity(),
                meetup.getMaxParticipants(),
                meetup.getMinParticipants(),
                meetup.getJoined(),
                meetup.getStatus(),
                meetup.getMode(),
                meetup.getLocation(),
                meetup.getCoverUrl(),
                meetup.getDescription(),
                meetup.getFeeInfo(),
                meetup.getTagsCsv(),
                meetup.getContentHtml(),
                meetup.getCreatedAt(),
                meetup.getUpdatedAt()
        );
    }
}