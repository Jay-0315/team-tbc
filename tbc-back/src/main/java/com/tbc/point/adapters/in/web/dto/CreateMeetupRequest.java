package com.tbc.point.adapters.in.web.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class CreateMeetupRequest {
    private Long hostId;
    private String title;
    private String topic;
    private String category;
    private String description;
    private String contentHtml;
    private String location;
    private String mode;
    private Integer capacity;
    private Integer maxParticipants;
    private Integer minParticipants;
    private Integer feeAmount;
    private String feeType;
    private String feeInfo;
    private String tagsCsv;
    private String status;
    private String coverUrl;
    private Integer joined;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}


