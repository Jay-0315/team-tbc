package com.tbc.events.web.controller;

import com.tbc.events.domain.model.EventStatus;
import com.tbc.events.application.facade.EventFacade;
import com.tbc.events.web.dto.EventCardDTO;
import com.tbc.events.web.dto.PageResponse;
import com.tbc.events.web.dto.EventDetailDTO;
import com.tbc.events.web.dto.FavoriteResponse;
import com.tbc.events.web.dto.JoinReq;
import com.tbc.events.web.dto.JoinRes;
import com.tbc.events.web.dto.ReviewDTO;
import com.tbc.events.web.dto.ReviewCreateReq;
import org.springframework.data.domain.Page;
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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventFacade eventFacade;

    public EventController(EventFacade eventFacade) {
        this.eventFacade = eventFacade;
    }

    @GetMapping
    @Operation(
            summary = "이벤트 목록 조회",
            description = "검색/카테고리/상태/정렬/페이지네이션 기준으로 이벤트 목록을 조회합니다. 검색은 제목과 설명에서 LIKE 검색을 수행합니다.",
            security = { @SecurityRequirement(name = "X-User-Id") }
    )
    @Parameters({
            @Parameter(name = "q", description = "검색어 (제목 또는 설명에서 검색)", required = false, example = "영화"),
            @Parameter(name = "category", description = "카테고리", required = false, example = "workshop"),
            @Parameter(name = "status", description = "상태", required = false, schema = @Schema(implementation = EventStatus.class, example = "OPEN")),
            @Parameter(name = "sort", description = "정렬키", required = false, schema = @Schema(allowableValues = {
                "CREATED_DESC", "START_ASC", "DEADLINE_ASC", "REVIEWS_DESC"
            }, example = "CREATED_DESC")),
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
    public PageResponse<EventCardDTO> list(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) EventStatus status,
            @RequestParam(required = false, defaultValue = "CREATED_DESC") String sort,
            Pageable pageable
    ) {
        Page<EventCardDTO> page = eventFacade.getEventList(q, category, status != null ? status.toString() : null, sort, pageable);
        return PageResponse.from(page);
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "이벤트 상세 조회",
            description = "이벤트 단건 상세를 조회합니다.",
            security = { @SecurityRequirement(name = "X-User-Id") }
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공",
                    content = @Content(schema = @Schema(implementation = EventDetailDTO.class))),
            @ApiResponse(responseCode = "404", description = "미존재", content = @Content(
                    schema = @Schema(implementation = com.tbc.common.exception.GlobalExceptionHandler.ErrorResponse.class)))
    })
    public EventDetailDTO detail(
            @Parameter(name = "id", description = "이벤트 ID", example = "1")
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        return eventFacade.getEventDetail(id);
    }

    @PostMapping("/{id}/favorite")
    @Operation(summary = "찜 토글", security = { @SecurityRequirement(name = "X-User-Id") })
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공",
                    content = @Content(schema = @Schema(implementation = FavoriteResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증 필요", content = @Content(
                    schema = @Schema(implementation = com.tbc.common.exception.GlobalExceptionHandler.ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "미존재", content = @Content(
                    schema = @Schema(implementation = com.tbc.common.exception.GlobalExceptionHandler.ErrorResponse.class)))
    })
    public FavoriteResponse toggleFavorite(
            @Parameter(name = "id", description = "이벤트 ID", example = "1")
            @PathVariable Long id,
            @Parameter(name = "X-User-Id", description = "임시 로그인 사용자 ID(헤더)", required = true, example = "1")
            @RequestHeader(value = "X-User-Id", required = true) Long userId
    ) {
        return eventFacade.toggleFavorite(id, userId);
    }

    @GetMapping("/{id}/reviews")
    @Operation(
            summary = "이벤트 후기 목록 조회",
            description = "특정 이벤트의 후기 목록을 페이지네이션으로 조회합니다. 최신 순으로 정렬됩니다.",
            tags = {"Reviews"},
            security = { @SecurityRequirement(name = "X-User-Id") }
    )
    @Parameters({
            @Parameter(name = "id", description = "이벤트 ID", required = true, example = "1"),
            @Parameter(name = "page", description = "페이지 번호 (0부터 시작)", example = "0"),
            @Parameter(name = "size", description = "페이지 크기", example = "10"),
            @Parameter(name = "X-User-Id", description = "사용자 ID (헤더)", required = false, example = "1")
    })
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공",
                    content = @Content(schema = @Schema(implementation = PageResponse.class))),
            @ApiResponse(responseCode = "404", description = "이벤트를 찾을 수 없음",
                    content = @Content(schema = @Schema(implementation = com.tbc.common.exception.GlobalExceptionHandler.ErrorResponse.class)))
    })
    public PageResponse<ReviewDTO> listReviews(
            @Parameter(name = "id", example = "1") @PathVariable Long id,
            Pageable pageable
    ) {
        Page<ReviewDTO> page = eventFacade.getEventReviews(id, pageable);
        return PageResponse.from(page);
    }

    @PostMapping("/{id}/reviews")
    @Operation(
            summary = "이벤트 후기 작성",
            description = "특정 이벤트에 대한 후기를 작성합니다. 평점은 1-5점, 댓글은 최대 500자까지 가능합니다.",
            tags = {"Reviews"},
            security = { @SecurityRequirement(name = "X-User-Id") }
    )
    @Parameters({
            @Parameter(name = "id", description = "이벤트 ID", required = true, example = "1"),
            @Parameter(name = "X-User-Id", description = "사용자 ID (헤더)", required = true, example = "1")
    })
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "후기 작성 성공",
                    content = @Content(schema = @Schema(implementation = ReviewDTO.class))),
            @ApiResponse(responseCode = "400", description = "검증 실패 (평점 범위, 댓글 길이 등)",
                    content = @Content(schema = @Schema(implementation = com.tbc.common.exception.GlobalExceptionHandler.ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증 필요 (X-User-Id 헤더 누락)",
                    content = @Content(schema = @Schema(implementation = com.tbc.common.exception.GlobalExceptionHandler.ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "이벤트를 찾을 수 없음",
                    content = @Content(schema = @Schema(implementation = com.tbc.common.exception.GlobalExceptionHandler.ErrorResponse.class)))
    })
    public ReviewDTO createReview(
            @Parameter(name = "id", example = "1") @PathVariable Long id,
            @Parameter(name = "X-User-Id", required = true, example = "1")
            @RequestHeader("X-User-Id") Long userId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    description = "후기 작성 요청",
                    content = @Content(
                            schema = @Schema(implementation = ReviewCreateReq.class),
                            examples = {
                                    @io.swagger.v3.oas.annotations.media.ExampleObject(
                                            name = "예시 1",
                                            summary = "5점 후기",
                                            value = "{\"rating\": 5, \"comment\": \"정말 좋은 이벤트였습니다! 다음에도 참여하고 싶어요.\"}"
                                    ),
                                    @io.swagger.v3.oas.annotations.media.ExampleObject(
                                            name = "예시 2",
                                            summary = "3점 후기",
                                            value = "{\"rating\": 3, \"comment\": \"괜찮았지만 개선할 점이 있어 보입니다.\"}"
                                    )
                            }
                    )
            )
            @RequestBody @jakarta.validation.Valid ReviewCreateReq body
    ) {
        return eventFacade.createEventReview(id, body, userId);
    }

    @PostMapping("/{id}/join")
    @Operation(summary = "이벤트 참가 신청", security = { @SecurityRequirement(name = "X-User-Id") })
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공",
                    content = @Content(schema = @Schema(implementation = JoinRes.class))),
            @ApiResponse(responseCode = "400", description = "검증 실패", content = @Content(schema = @Schema(implementation = com.tbc.common.exception.GlobalExceptionHandler.ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증 필요", content = @Content(schema = @Schema(implementation = com.tbc.common.exception.GlobalExceptionHandler.ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "미존재", content = @Content(schema = @Schema(implementation = com.tbc.common.exception.GlobalExceptionHandler.ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "좌석 부족 등", content = @Content(schema = @Schema(implementation = com.tbc.common.exception.GlobalExceptionHandler.ErrorResponse.class)))
    })
    public JoinRes join(
            @Parameter(name = "id", description = "이벤트 ID", example = "1")
            @PathVariable Long id,
            @Parameter(name = "X-User-Id", description = "임시 로그인 사용자 ID(헤더)", required = true, example = "1")
            @RequestHeader(value = "X-User-Id", required = true) Long userId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true,
                    content = @Content(schema = @Schema(implementation = JoinReq.class)))
            @RequestBody @jakarta.validation.Valid JoinReq body
    ) {
        return eventFacade.joinEvent(id, body);
    }
}
