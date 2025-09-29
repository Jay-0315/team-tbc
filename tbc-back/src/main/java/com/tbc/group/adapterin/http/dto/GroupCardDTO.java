package com.tbc.group.adapterin.http.dto;

import com.tbc.group.domain.model.Group;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Schema(name = "GroupCardDTO", description = "그룹 카드 요약 정보")
public class GroupCardDTO {
    @Schema(description = "그룹 ID", example = "1")
    public Long id;

    @Schema(description = "그룹 제목", example = "주말 러닝 모임")
    public String title;

    @Schema(description = "카테고리", example = "운동")
    public String category;

    @Schema(description = "주제", example = "건강한 라이프스타일")
    public String topic;

    @Schema(description = "최소 참가자 수", example = "5")
    public Integer minParticipants;

    @Schema(description = "최대 참가자 수", example = "12")
    public Integer maxParticipants;

    @Schema(description = "모드", example = "OFFLINE")
    public String mode;

    @Schema(description = "참가비 타입", example = "FREE")
    public String feeType;

    @Schema(description = "참가비 금액", example = "0")
    public Integer feeAmount;

    @Schema(description = "태그 목록", example = "[\"운동\", \"건강\", \"러닝\"]")
    public List<String> tags;

    @Schema(description = "호스트 ID", example = "1")
    public Long hostId;
    @Schema(description = "장소", example = "서울시 강남구")
    public String location;

    @Schema(description = "이벤트 날짜", example = "2025-09-10")
    public LocalDate eventDate;

    @Schema(description = "이벤트 시간", example = "14:30")
    public LocalTime eventTime;
    @Schema(description = "생성일시", example = "2025-09-22T10:00:00")
    public LocalDateTime createdAt;

    public static GroupCardDTO from(Group group) {
        GroupCardDTO dto = new GroupCardDTO();
        dto.id = group.id();
        dto.title = group.title();
        dto.category = group.category();
        dto.topic = group.topic();
        dto.minParticipants = group.minParticipants();
        dto.maxParticipants = group.maxParticipants();
        dto.mode = group.mode().name();
        dto.feeType = group.feeType().name();
        dto.feeAmount = group.feeAmount();
        dto.tags = group.tags();
        dto.hostId = group.hostId();
        dto.location = group.location();
        dto.eventDate = group.eventDate();
        dto.eventTime = group.eventTime();        dto.createdAt = LocalDateTime.now(); // 임시로 현재 시간 사용
        return dto;
    }
}
