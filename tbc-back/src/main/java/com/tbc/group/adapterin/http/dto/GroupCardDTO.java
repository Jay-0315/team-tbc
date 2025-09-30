package com.tbc.group.adapterin.http.dto;

import com.tbc.group.domain.model.Group;
import io.swagger.v3.oas.annotations.media.Schema;

<<<<<<< HEAD
import java.time.LocalDateTime;
=======
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
>>>>>>> origin/dev
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
<<<<<<< HEAD

    @Schema(description = "생성일시", example = "2025-09-22T10:00:00")
    public LocalDateTime createdAt;

=======
    
    @Schema(description = "장소", example = "서울시 강남구")
    public String location;
    
    @Schema(description = "위도", example = "37.5663")
    public Double latitude;
    
    @Schema(description = "경도", example = "126.9779")
    public Double longitude;
    
    @Schema(description = "이미지 경로", example = "/uploads/abc-123.jpg")
    public String imagePath;

    @Schema(description = "이벤트 날짜", example = "2025-09-10")
    public LocalDate eventDate;

    @Schema(description = "이벤트 시간", example = "14:30")
    public LocalTime eventTime;
    
    @Schema(description = "생성일시", example = "2025-09-22T10:00:00")
    public LocalDateTime createdAt;

    @Schema(description = "현재 참가자 수", example = "5")
    public Integer joined;

    @Schema(description = "정원", example = "12")
    public Integer capacity;

    @Schema(description = "커버 이미지 URL", example = "https://example.com/cover.jpg")
    public String coverUrl;

    @Schema(description = "호스트 닉네임", example = "홍길동")
    public String hostNickname;

    @Schema(description = "호스트 프로필 이미지 URL", example = "https://example.com/profile.jpg")
    public String hostProfileImage;

    @Schema(description = "찜 여부", example = "false")
    public Boolean favorited;

>>>>>>> origin/dev
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
<<<<<<< HEAD
        dto.createdAt = LocalDateTime.now(); // 임시로 현재 시간 사용
=======
        dto.location = group.location();
        dto.latitude = group.latitude();
        dto.longitude = group.longitude();
        dto.imagePath = group.imagePath();
        dto.eventDate = group.eventDate();
        dto.eventTime = group.eventTime();
        dto.createdAt = LocalDateTime.now(); // 임시로 현재 시간 사용
        dto.joined = group.joined();
        dto.capacity = group.capacity();
        dto.coverUrl = group.coverUrl();
        dto.favorited = null; // 초기값 null, 이후 enrichPageWithHostInfo에서 설정
>>>>>>> origin/dev
        return dto;
    }
}
