// MyMeetupItemDto.java
package com.tbc.tbc.mypage.adapters.in.web.dto;

import lombok.*;
import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MyMeetupItemDto {
    private Long meetupId;            // String → Long
    private String title;
    private Instant startAt;
    private Instant endAt;

    // 참여자일 때
    private String role;              // ATTENDEE / HOST / CO_HOST
    private String participantStatus; // APPROVED / PENDING / CANCELLED ...

    // 공통
    private String meetupStatus;      // DRAFT / OPEN / CLOSED / CANCELLED / FINISHED
    private int participantCount;     // 현재 참가자 수
    private int pricePoints;          // 참가 비용

    private Instant joinedAt;         // 내가 참여했을 때만 (호스트는 null)
}
