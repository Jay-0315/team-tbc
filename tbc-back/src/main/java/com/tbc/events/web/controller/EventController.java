package com.tbc.events.web.controller;

import com.tbc.group.adapterin.http.dto.GroupCardDTO;
import com.tbc.group.application.facade.GroupReadFacade;
import com.tbc.events.web.dto.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.stereotype.Component;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Component
public class EventController {

    private final GroupReadFacade groupReadFacade;

    @GetMapping
    @Operation(
            summary = "이벤트 목록 조회 (events 테이블 사용)",
            description = "events 테이블에서 그룹 데이터를 이벤트 형태로 조회합니다.",
            security = { @SecurityRequirement(name = "X-User-Id") }
    )
    @Parameters({
            @Parameter(name = "category", description = "카테고리", required = false, example = "ETC"),
            @Parameter(name = "status", description = "상태", required = false, example = "OPEN"),
            @Parameter(name = "sort", description = "정렬키", required = false, example = "CREATED_DESC"),
            @Parameter(name = "page", description = "페이지(0-base)", required = false, example = "0"),
            @Parameter(name = "size", description = "페이지 크기", required = false, example = "12"),
            @Parameter(name = "X-User-Id", description = "임시 로그인 사용자 ID(헤더)", required = false)
    })
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공",
                    content = @Content(schema = @Schema(implementation = PageResponse.class))),
            @ApiResponse(responseCode = "400", description = "요청 오류", content = @Content(
                    schema = @Schema(implementation = com.tbc.common.exception.GlobalExceptionHandler.ErrorResponse.class)))
    })
    public PageResponse<GroupCardDTO> list(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "CREATED_DESC") String sort,
            Pageable pageable
    ) {
        // events 테이블에서 데이터 조회
        Page<GroupCardDTO> page = groupReadFacade.findAll(pageable);
        return PageResponse.from(page);
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "이벤트 상세 조회 (events 테이블 사용)",
            description = "events 테이블에서 그룹 상세를 이벤트 형태로 조회합니다.",
            security = { @SecurityRequirement(name = "X-User-Id") }
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공",
                    content = @Content(schema = @Schema(implementation = GroupCardDTO.class))),
            @ApiResponse(responseCode = "404", description = "미존재", content = @Content(
                    schema = @Schema(implementation = com.tbc.common.exception.GlobalExceptionHandler.ErrorResponse.class)))
    })
    public GroupCardDTO detail(
            @Parameter(name = "id", description = "이벤트 ID", example = "1")
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        return groupReadFacade.findOne(id);
    }
}
