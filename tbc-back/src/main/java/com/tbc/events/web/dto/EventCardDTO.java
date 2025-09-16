package com.tbc.events.web.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.tbc.events.domain.model.Event;
import com.tbc.events.domain.model.EventStatus;

import java.time.Instant;
import java.time.ZoneOffset;
import io.swagger.v3.oas.annotations.media.Schema;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(name = "EventCardDTO", description = "이벤트 카드 요약 정보")
public class EventCardDTO {
    @Schema(description = "이벤트 ID", example = "1")
    public Long id;

    @Schema(description = "이벤트 제목", example = "React 스터디 1기 모집")
    public String title;

    @Schema(description = "커버 이미지 URL", example = "https://example.com/cover.jpg")
    public String coverUrl;

    @Schema(description = "카테고리", example = "workshop")
    public String category;

    @Schema(description = "상태", example = "OPEN")
    public EventStatus status;

    @Schema(description = "남은 좌석 수", example = "90")
    public Integer remainingSeats;

    @Schema(description = "시작 시각(UTC)", example = "2025-09-10T09:00:00Z")
    public Instant startAt;

    @Schema(description = "장소", example = "Seoul")
    public String location;

    @Schema(description = "총 정원", example = "100")
    public Integer capacity;

    @Schema(description = "현재 참가자 수", example = "10")
    public Integer joined;

    @Schema(description = "즐겨찾기 여부(로그인 헤더 있을 때만 포함)", example = "false", nullable = true)
    public Boolean favorited;

    public static EventCardDTO from(Event e, Boolean favorited) {
        EventCardDTO dto = new EventCardDTO();
        dto.id = e.getId();
        dto.title = e.getTitle();
        dto.coverUrl = e.getCoverUrl();
        dto.category = e.getCategory();
        dto.status = e.getStatus();
        dto.capacity = e.getCapacity();
        dto.joined = e.getJoined();
        dto.remainingSeats = Math.max(0, e.getCapacity() - e.getJoined());
        dto.startAt = e.getStartAt() == null ? null : e.getStartAt().atOffset(ZoneOffset.UTC).toInstant();
        dto.location = e.getLocation();
        dto.favorited = favorited;
        return dto;
    }
}



