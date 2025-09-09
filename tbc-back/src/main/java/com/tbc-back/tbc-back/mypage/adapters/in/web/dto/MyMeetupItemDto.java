package com.tbc_back.tbc_back.mypage.adapters.in.web.dto;

import lombok.*;
import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MyMeetupItemDto {
    private String meetupId;
    private String title;
    private Instant startAt;
    private String role;       // ATTENDEE / HOST ...
    private String status;     // APPROVED / PENDING ...
    private Instant joinedAt;
}
