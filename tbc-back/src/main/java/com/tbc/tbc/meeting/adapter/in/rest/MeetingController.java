package com.tbc.tbc.meeting.adapter.in.rest;

import com.tbc.tbc.meeting.application.port.in.JoinMeetingUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final JoinMeetingUseCase joinMeetingUseCase;

    @Operation(summary = "모임 참가", description = "특정 모임에 참가한다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "참가 완료"),
            @ApiResponse(responseCode = "400", description = "이미 참가한 모임이거나 참가 불가")
    })
    @PostMapping("/{meetingId}/join")
    public ResponseEntity<String> joinMeeting(@PathVariable Long meetingId,
                                              @AuthenticationPrincipal String username) {
        // username = JWT에서 파싱된 사용자 식별값 (보통 email/username)
        // 필요하면 DB 조회해서 userId로 변환
        return ResponseEntity.ok("참가 완료");
    }
}
