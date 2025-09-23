package com.tbc.tbc.meeting.adapter.in.rest;

import com.tbc.tbc.meeting.application.port.in.JoinMeetingUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.HttpStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.tbc.tbc.point.application.exception.InsufficientPointsException;
import com.tbc.tbc.point.application.exception.AlreadyJoinedException;

@RestController
@RequestMapping("/api/meetups")
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
                                              @RequestParam(value = "userId") Long userId) {
        joinMeetingUseCase.join(userId, meetingId);
        return ResponseEntity.ok("OK");
    }

    // 간결한 에러 바디로 매핑
    @ExceptionHandler(InsufficientPointsException.class)
    public ResponseEntity<String> handleInsufficient(InsufficientPointsException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body("INSUFFICIENT_POINTS");
    }

    @ExceptionHandler(AlreadyJoinedException.class)
    public ResponseEntity<String> handleAlreadyJoined(AlreadyJoinedException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body("ALREADY_JOINED");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleAlreadyJoinedOrBad(IllegalArgumentException e) {
        String msg = e.getMessage() == null ? "" : e.getMessage();
        if (msg.contains("이미 참가")) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("ALREADY_JOINED");
        }
        return ResponseEntity.badRequest().body(msg);
    }
}