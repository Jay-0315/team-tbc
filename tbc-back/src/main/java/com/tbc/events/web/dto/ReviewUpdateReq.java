package com.tbc.events.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ReviewUpdateReq {
    @Min(1)
    @Max(5)
    @Schema(description = "평점(1~5)", example = "4")
    public Integer rating;

    @NotBlank
    @Size(min = 1, max = 500)
    @Schema(description = "코멘트", example = "수정된 후기입니다!", minLength = 1, maxLength = 500)
    public String comment;
}
