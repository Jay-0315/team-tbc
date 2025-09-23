package com.tbc.tbc.point.adapters.in.web;

import com.tbc.tbc.point.application.exception.InsufficientPointsException;
import com.tbc.tbc.point.application.exception.AlreadyJoinedException;
import com.tbc.tbc.point.application.facade.MeetupJoinFacade;
import com.tbc.tbc.point.adapters.in.web.dto.ParticipantResponse;
import com.tbc.tbc.point.adapters.out.persistence.jpa.SpringDataMeetupJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meetups-legacy")
@RequiredArgsConstructor
public class MeetupJoinController {

    private final MeetupJoinFacade facade;
    private final SpringDataMeetupJpaRepository meetupRepo;

    // 참가하기
    @PostMapping("/{meetupId}/join")
    public ResponseEntity<String> join(@PathVariable Long meetupId,   // String → Long
                                       @RequestParam Long userId) {   // String → Long
        facade.joinMeetup(userId, meetupId);
        return ResponseEntity.ok("DEDUCTED");
    }

    // 참가자 목록
    @GetMapping("/{meetupId}/participants")
    public List<ParticipantResponse> participants(@PathVariable Long meetupId,  // String → Long
                                                  @RequestParam(defaultValue = "true") boolean excludeCancelled) {
        return facade.listParticipants(meetupId, excludeCancelled);
    }

    // 예외 핸들러들
    @ExceptionHandler(InsufficientPointsException.class)
    public ResponseEntity<String> handleInsufficient(InsufficientPointsException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body("INSUFFICIENT_POINTS");
    }

    @ExceptionHandler(AlreadyJoinedException.class)
    public ResponseEntity<String> handleAlreadyJoined(AlreadyJoinedException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body("ALREADY_JOINED");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBad(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}
