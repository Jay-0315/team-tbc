package com.tbc.point.adapters.in.web.dto;

import com.tbc.point.domain.model.Meetup;

import java.time.LocalDateTime;

public record MeetupSummaryResponse(
        Long id,
        String title,
        String topic,
        String category,
        Integer feeAmount,
        String status,
        String mode,
        String location,
        Integer capacity,
        Integer joined,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static MeetupSummaryResponse from(Meetup meetup) {
        return new MeetupSummaryResponse(
                meetup.getId(),
                meetup.getTitle(),
                meetup.getTopic(),
                meetup.getCategory(),
                meetup.getFeeAmount(),
                meetup.getStatus(),
                meetup.getMode(),
                meetup.getLocation(),
                meetup.getCapacity(),
                meetup.getJoined(),
                meetup.getCreatedAt(),
                meetup.getUpdatedAt()
        );
    }
}