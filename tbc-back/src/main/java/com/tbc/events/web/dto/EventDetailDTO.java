package com.tbc.events.web.dto;

import com.tbc.group.adapterout.persistence.jpa.entity.GroupEntity;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.ZoneOffset;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Schema(name = "EventDetailDTO", description = "이벤트 상세 정보")
public class EventDetailDTO extends EventCardDTO {

    @Schema(description = "상세 설명", example = "React와 TypeScript로 실무형 프로젝트를 진행합니다.")
    public String description;

    @Schema(description = "호스트 이름", example = "TEAM-TBC")
    public String hostName;

    @Schema(description = "호스트 닉네임", example = "홍길동")
    public String hostNickname;

    @Schema(description = "호스트 프로필 이미지 URL", example = "https://example.com/profile.jpg")
    public String hostProfileImage;

    @Schema(description = "컨텐츠 HTML", example = "<p>리치 텍스트</p>")
    public String contentHtml;

    @ArraySchema(arraySchema = @Schema(description = "태그 목록"), schema = @Schema(example = "react"))
    public List<String> tags;

    @Schema(description = "요금 정보", example = "무료")
    public String feeInfo;

    @Schema(description = "최소 참가 인원", example = "5")
    public Integer minParticipants;

    @Schema(description = "최대 참가 인원", example = "20")
    public Integer maxParticipants;

    @Schema(description = "정산 상태", example = "PENDING|SETTLED|REFUNDED")
    public String settlementStatus;
    @Schema(description = "정산 시각(UTC)")
    public java.time.Instant settledAt;

    public static EventDetailDTO fromGroupEntity(GroupEntity e, Boolean favorited, List<String> tags, String hostName, String hostNickname, String hostProfileImage) {
        EventDetailDTO dto = new EventDetailDTO();
        dto.id = e.getId();
        dto.title = e.getTitle();
        dto.coverUrl = e.getCoverUrl();
        dto.category = e.getCategory();
        dto.status = "OPEN";
        dto.capacity = e.getCapacity();
        dto.joined = e.getJoined();
        dto.remainingSeats = Math.max(0, e.getCapacity() - e.getJoined());
        // Interpret DB LocalDateTime as Asia/Seoul local time for correct frontend display
        dto.startAt = e.getStartAt() == null ? null : e.getStartAt().atZone(ZoneId.of("Asia/Seoul")).toInstant();
        dto.location = e.getLocation();
        dto.eventDate = e.getEventDate();
        dto.eventTime = e.getEventTime();
        dto.favorited = favorited;
        dto.description = e.getTopic(); // GroupEntity에는 description이 없고 topic이 있음
        dto.tags = tags != null ? tags : (e.getTagsCsv() != null && !e.getTagsCsv().isEmpty() 
                ? Arrays.asList(e.getTagsCsv().split(",")) 
                : Collections.emptyList());
        dto.hostName = hostName;
        dto.hostNickname = hostNickname;
        dto.hostProfileImage = hostProfileImage;
        dto.feeType = e.getFeeType();
        dto.feeAmount = e.getFeeAmount();
        dto.feeInfo = e.getFeeInfo();
        dto.minParticipants = e.getMinParticipants();
        dto.maxParticipants = e.getMaxParticipants();
        dto.settlementStatus = e.getSettlementStatus();
        dto.settledAt = e.getSettledAt() == null ? null : e.getSettledAt().atZone(ZoneId.of("Asia/Seoul")).toInstant();
        dto.hostId = e.getHostId();
        dto.contentHtml = e.getContentHtml();
        dto.latitude = e.getLatitude();
        dto.longitude = e.getLongitude();
        dto.imagePath = e.getImagePath();
        return dto;
    }
}
