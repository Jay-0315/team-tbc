package com.tbc_back.tbc_back.adapters.in.web;

import com.tbc_back.tbc_back.application.exception.InsufficientPointsException;
import com.tbc_back.tbc_back.application.exception.AlreadyJoinedException; // ⬅️ 추가
import com.tbc_back.tbc_back.application.facade.MeetupJoinFacade;
import com.tbc_back.tbc_back.adapters.in.web.dto.ParticipantResponse; // ⬅️ 추가
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List; // ⬅️ 추가

@RestController
@RequestMapping("/api/meetups")
@RequiredArgsConstructor
public class MeetupJoinController {

    private final MeetupJoinFacade facade;

    // 예: POST /api/meetups/{meetupId}/join?userId=xxxxxxxx-xxxx...
    @PostMapping("/{meetupId}/join")
    public ResponseEntity<String> join(@PathVariable String meetupId,
                                       @RequestParam String userId) {
        facade.joinMeetup(userId, meetupId);
        return ResponseEntity.ok("DEDUCTED");
    }

    // ⬇️ 참가자 목록: 기본값으로 CANCELLED 제외
    // 예: GET /api/meetups/{meetupId}/participants?excludeCancelled=true
    @GetMapping("/{meetupId}/participants")
    public List<ParticipantResponse> participants(@PathVariable String meetupId,
                                                  @RequestParam(defaultValue = "true") boolean excludeCancelled) {
        return facade.listParticipants(meetupId, excludeCancelled);
    }

    @ExceptionHandler(InsufficientPointsException.class)
    public ResponseEntity<String> handleInsufficient(InsufficientPointsException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body("INSUFFICIENT_POINTS");
    }

    // ⬇️ 중복 참가 409
    @ExceptionHandler(AlreadyJoinedException.class)
    public ResponseEntity<String> handleAlreadyJoined(AlreadyJoinedException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body("ALREADY_JOINED");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBad(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}
