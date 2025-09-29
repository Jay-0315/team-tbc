package com.tbc.group.domain.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public record Group(
        Long id,
        String title,
        String category,
        String topic,
        int minParticipants,
        int maxParticipants,
        Mode mode,
        FeeType feeType,
        Integer feeAmount,
        String feeInfo,
        List<String> tags,
        String contentHtml,
        Long hostId,
        String location,
        LocalDate eventDate,
        LocalTime eventTime,
        int capacity, // Added this field
        int joined,   // Added this field
        String coverUrl, // Added cover_url field
        LocalDateTime startAt // Added start_at field
) {
    public static Group create(
            String title,
            String category,
            String topic,
            int minParticipants,
            int maxParticipants,
            Mode mode,
            FeeType feeType,
            Integer feeAmount,
            String feeInfo,
            List<String> tags,
            String contentHtml,
            Long hostId,
            String location,
            LocalDate eventDate,
            LocalTime eventTime,
            int capacity, // Added this field
            int joined,   // Added this field
            String coverUrl, // Added cover_url field
            LocalDateTime startAt // Added start_at field
    ) {
        return new Group(
                null, title, category, topic,
                minParticipants, maxParticipants, mode,
                feeType, feeAmount, feeInfo,
                tags, contentHtml, hostId,
                location, eventDate, eventTime,
                capacity, joined, coverUrl, startAt // Added these fields
        );
    }

    public enum Mode {ONLINE, OFFLINE}
    public enum FeeType {FREE, PAID}
}
