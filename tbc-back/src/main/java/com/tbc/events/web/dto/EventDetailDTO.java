package com.tbc.events.web.dto;

import com.tbc.events.domain.model.Event;
import com.tbc.events.domain.model.EventStatus;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;

@Schema(name = "EventDetailDTO", description = "이벤트 상세 정보")
public class EventDetailDTO extends EventCardDTO {

    @Schema(description = "상세 설명", example = "React와 TypeScript로 실무형 프로젝트를 진행합니다.")
    public String description;

    @Schema(description = "호스트 이름", example = "TEAM-TBC")
    public String hostName;

    @ArraySchema(arraySchema = @Schema(description = "태그 목록"), schema = @Schema(example = "react"))
    public List<String> tags;

    public static EventDetailDTO from(Event e, Boolean favorited, List<String> tags, String hostName) {
        EventDetailDTO dto = new EventDetailDTO();
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
        dto.eventDate = e.getEventDate();
        dto.eventTime = e.getEventTime();        dto.favorited = favorited;
        dto.description = e.getDescription();
        dto.tags = tags;
        dto.hostName = hostName;
        return dto;
    }
}



