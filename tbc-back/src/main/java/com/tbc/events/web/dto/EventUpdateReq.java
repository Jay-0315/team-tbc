package com.tbc.events.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public class EventUpdateReq {
    @NotBlank
    @Size(min = 1, max = 200)
    @Schema(description = "이벤트 제목", example = "스터디 모임", minLength = 1, maxLength = 200)
    public String title;

    @NotBlank
    @Size(min = 1, max = 50)
    @Schema(description = "카테고리", example = "STUDY", minLength = 1, maxLength = 50)
    public String category;

    @NotNull
    @Positive
    @Schema(description = "최대 참가자 수", example = "10")
    public Integer capacity;

    @NotNull
    @Schema(description = "이벤트 날짜", example = "2024-01-15")
    public LocalDate eventDate;

    @NotNull
    @Schema(description = "이벤트 시간", example = "14:00")
    public LocalTime eventTime;

    @NotBlank
    @Size(min = 1, max = 200)
    @Schema(description = "장소", example = "강남역 스타벅스", minLength = 1, maxLength = 200)
    public String location;

    @Schema(description = "위도", example = "37.5665")
    public Double latitude;

    @Schema(description = "경도", example = "126.9780")
    public Double longitude;

    @Schema(description = "참가비 타입", example = "FREE")
    public String feeType;

    @Schema(description = "참가비 금액", example = "0")
    public Integer feeAmount;

    @Schema(description = "참가비 정보", example = "무료")
    public String feeInfo;

    @Schema(description = "커버 이미지 URL", example = "https://example.com/cover.jpg")
    public String coverUrl;

    @Schema(description = "컨텐츠 HTML", example = "<p>리치 텍스트</p>")
    public String contentHtml;
}
