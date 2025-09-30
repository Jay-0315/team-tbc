package com.tbc.group.domain.model;

<<<<<<< HEAD
=======
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
>>>>>>> origin/dev
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
<<<<<<< HEAD
        Long hostId
=======
        Long hostId,
        String location,
        Double latitude,  // 위도
        Double longitude, // 경도
        String imagePath, // 이미지 경로
        LocalDate eventDate,
        LocalTime eventTime,
        int capacity, // Added this field
        int joined,   // Added this field
        String coverUrl, // Added cover_url field
        LocalDateTime startAt // Added start_at field
>>>>>>> origin/dev
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
<<<<<<< HEAD
            Long hostId
=======
            Long hostId,
            String location,
            Double latitude,  // 위도
            Double longitude, // 경도
            String imagePath, // 이미지 경로
            LocalDate eventDate,
            LocalTime eventTime,
            int capacity, // Added this field
            int joined,   // Added this field
            String coverUrl, // Added cover_url field
            LocalDateTime startAt // Added start_at field
>>>>>>> origin/dev
    ) {
        return new Group(
                null, title, category, topic,
                minParticipants, maxParticipants, mode,
                feeType, feeAmount, feeInfo,
<<<<<<< HEAD
                tags, contentHtml, hostId
        );
    }


public enum Mode {ONLINE, OFFLINE}
    public enum FeeType {FREE, PAID}
}
=======
                tags, contentHtml, hostId,
                location, latitude, longitude, imagePath,
                eventDate, eventTime,
                capacity, joined, coverUrl, startAt // Added these fields
        );
    }

    public enum Mode {ONLINE, OFFLINE}
    public enum FeeType {FREE, PAID}
}
>>>>>>> origin/dev
