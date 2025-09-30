package com.tbc.events.web.controller;

import com.tbc.events.application.facade.EventFacade;
import com.tbc.events.web.dto.*;
import com.tbc.login.domain.UserService;
import com.tbc.login.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import jakarta.validation.Valid;

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
public class EventController {

        private final EventFacade eventFacade;
        private final UserService userService;

        @GetMapping
        @Operation(summary = "이벤트 목록 조회 (events 테이블 사용)", description = "events 테이블에서 그룹 데이터를 이벤트 형태로 조회합니다.", security = {
                        @SecurityRequirement(name = "X-User-Id") })
        @Parameters({
                        @Parameter(name = "category", description = "카테고리", required = false, example = "ETC"),
                        @Parameter(name = "status", description = "상태", required = false, example = "OPEN"),
                        @Parameter(name = "sort", description = "정렬키", required = false, example = "CREATED_DESC"),
                        @Parameter(name = "page", description = "페이지(0-base)", required = false, example = "0"),
                        @Parameter(name = "size", description = "페이지 크기", required = false, example = "12"),
                        @Parameter(name = "X-User-Id", description = "임시 로그인 사용자 ID(헤더)", required = false)
        })
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "성공", content = @Content(schema = @Schema(implementation = PageResponse.class))),
                        @ApiResponse(responseCode = "400", description = "요청 오류", content = @Content(schema = @Schema(implementation = com.tbc.common.exception.GlobalExceptionHandler.ErrorResponse.class)))
        })
        public PageResponse<EventCardDTO> list(
                        @RequestHeader(value = "X-User-Id", required = false) Long userId,
                        @RequestParam(required = false) String q,
                        @RequestParam(required = false) String category,
                        @RequestParam(required = false) String status,
                        @RequestParam(required = false, defaultValue = "CREATED_DESC") String sort,
                        Pageable pageable) {
                Page<EventCardDTO> page = eventFacade.getEventList(q, category, status, sort, pageable);
                return PageResponse.from(page);
        }

        @GetMapping("/{id}")
        @Operation(summary = "이벤트 상세 조회 (events 테이블 사용)", description = "events 테이블에서 그룹 상세를 이벤트 형태로 조회합니다.", security = {
                        @SecurityRequirement(name = "X-User-Id") })
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "성공", content = @Content(schema = @Schema(implementation = EventDetailDTO.class))),
                        @ApiResponse(responseCode = "404", description = "미존재", content = @Content(schema = @Schema(implementation = com.tbc.common.exception.GlobalExceptionHandler.ErrorResponse.class)))
        })
        public EventDetailDTO detail(
                        @Parameter(name = "id", description = "이벤트 ID", example = "1") @PathVariable Long id,
                        @RequestHeader(value = "X-User-Id", required = false) Long userId) {
                return eventFacade.getEventDetail(id);
        }

        @GetMapping("/{id}/reviews")
        @Operation(summary = "이벤트 후기 목록 조회", description = "특정 이벤트의 후기 목록을 조회합니다.", tags = { "Reviews" })
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "성공", content = @Content(schema = @Schema(implementation = PageResponse.class))),
                        @ApiResponse(responseCode = "404", description = "이벤트를 찾을 수 없음")
        })
        public PageResponse<ReviewDTO> listReviews(
                        @PathVariable Long id,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<ReviewDTO> reviews = eventFacade.getEventReviews(id, pageable);
                return PageResponse.from(reviews);
        }

        @PostMapping("/{id}/reviews")
        @Operation(summary = "이벤트 후기 작성", description = "특정 이벤트에 후기를 작성합니다.", tags = { "Reviews" })
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "후기 작성 성공"),
                        @ApiResponse(responseCode = "404", description = "이벤트를 찾을 수 없음")
        })
        public ReviewDTO createReview(
                        @PathVariable Long id,
                        @RequestBody @Valid ReviewCreateReq reviewCreateReq,
                        Authentication authentication) {
                Long userId = getUserId(authentication);
                return eventFacade.createEventReview(id, reviewCreateReq, userId);
        }

        @PutMapping("/{id}")
        @Operation(summary = "이벤트 수정", description = "본인이 작성한 이벤트를 수정합니다.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "수정 성공"),
                        @ApiResponse(responseCode = "403", description = "권한 없음"),
                        @ApiResponse(responseCode = "404", description = "이벤트를 찾을 수 없음")
        })
        public EventDetailDTO updateEvent(
                        @PathVariable Long id,
                        @RequestBody @Valid EventUpdateReq updateReq,
                        Authentication authentication) {
                Long userId = getUserId(authentication);
                return eventFacade.updateEvent(id, updateReq, userId);
        }

        @DeleteMapping("/{id}")
        @Operation(summary = "이벤트 삭제", description = "본인이 작성한 이벤트를 삭제합니다.")
        @ApiResponses({
                        @ApiResponse(responseCode = "204", description = "삭제 성공"),
                        @ApiResponse(responseCode = "403", description = "권한 없음"),
                        @ApiResponse(responseCode = "404", description = "이벤트를 찾을 수 없음")
        })
        public ResponseEntity<Void> deleteEvent(
                        @PathVariable Long id,
                        Authentication authentication) {
                Long userId = getUserId(authentication);
                eventFacade.deleteEvent(id, userId);
                return ResponseEntity.noContent().build();
        }

        @PutMapping("/{id}/reviews/{reviewId}")
        @Operation(summary = "이벤트 후기 수정", description = "본인이 작성한 후기를 수정합니다.", tags = { "Reviews" })
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "수정 성공"),
                        @ApiResponse(responseCode = "403", description = "권한 없음"),
                        @ApiResponse(responseCode = "404", description = "후기를 찾을 수 없음")
        })
        public ReviewDTO updateReview(
                        @PathVariable Long id,
                        @PathVariable Long reviewId,
                        @RequestBody @Valid ReviewUpdateReq req,
                        Authentication authentication) {
                Long userId = getUserId(authentication);
                return eventFacade.updateReview(id, reviewId, req, userId);
        }

        @DeleteMapping("/{id}/reviews/{reviewId}")
        @Operation(summary = "이벤트 후기 삭제", description = "본인이 작성한 후기를 삭제합니다.", tags = { "Reviews" })
        @ApiResponses({
                        @ApiResponse(responseCode = "204", description = "삭제 성공"),
                        @ApiResponse(responseCode = "403", description = "권한 없음"),
                        @ApiResponse(responseCode = "404", description = "후기를 찾을 수 없음")
        })
        public ResponseEntity<Void> deleteReview(
                        @PathVariable Long id,
                        @PathVariable Long reviewId,
                        Authentication authentication) {
                Long userId = getUserId(authentication);
                eventFacade.deleteReview(id, reviewId, userId);
                return ResponseEntity.noContent().build();
        }

        private Long getUserId(Authentication authentication) {
                if (authentication == null || !authentication.isAuthenticated()) {
                        return null;
                }
                String email = authentication.getName();
                User user = userService.findByEmailOptional(email)
                                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException(
                                                "사용자를 찾을 수 없습니다."));
                return user.getId();
        }
}
