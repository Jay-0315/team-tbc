package com.tbc.events.web.dto;

import com.tbc.events.domain.model.EventReview;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(name = "ReviewDTO")
public class ReviewDTO {
    @Schema(example = "1")
    public Long id;
    @Schema(example = "1")
    public Long userId;
    @Schema(example = "5")
    public Integer rating;
    @Schema(example = "좋았어요!")
    public String comment;
    @Schema(example = "2025-09-09T12:00:00Z")
    public Instant createdAt;

    public static ReviewDTO from(EventReview r) {
        ReviewDTO dto = new ReviewDTO();
        dto.id = r.getId();
        dto.userId = r.getUserId();
        dto.rating = r.getRating();
        dto.comment = r.getComment();
        dto.createdAt = r.getCreatedAt();
        return dto;
    }
}



