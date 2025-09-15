package com.tbc.events.web.dto;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.data.domain.Page;

import java.util.List;

@Schema(name = "PageResponse", description = "페이지 응답 래퍼")
public class PageResponse<T> {
    @ArraySchema(arraySchema = @Schema(description = "현재 페이지 콘텐츠"))
    public List<T> content;

    @Schema(description = "전체 요소 수", example = "100")
    public long totalElements;

    @Schema(description = "전체 페이지 수", example = "9")
    public int totalPages;

    @Schema(description = "현재 페이지 번호(0-base)", example = "0")
    public int number;

    @Schema(description = "페이지 크기", example = "12")
    public int size;

    @Schema(description = "첫 번째 페이지 여부", example = "true")
    public boolean first;

    @Schema(description = "마지막 페이지 여부", example = "false")
    public boolean last;

    public static <T> PageResponse<T> from(Page<T> page) {
        PageResponse<T> res = new PageResponse<>();
        res.content = page.getContent();
        res.totalElements = page.getTotalElements();
        res.totalPages = page.getTotalPages();
        res.number = page.getNumber();
        res.size = page.getSize();
        res.first = page.isFirst();
        res.last = page.isLast();
        return res;
    }
}



