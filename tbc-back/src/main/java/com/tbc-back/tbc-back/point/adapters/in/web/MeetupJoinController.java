package com.tbc_back.tbc_back.adapters.in.web;

import com.tbc_back.tbc_back.application.exception.InsufficientPointsException;
import com.tbc_back.tbc_back.application.facade.MeetupJoinFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/meetups")
@RequiredArgsConstructor
public class MeetupJoinController {

    private final MeetupJoinFacade facade;

    // 예: POST /api/meetups/{meetupId}/join?userId=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    @PostMapping("/{meetupId}/join")
    public ResponseEntity<String> join(@PathVariable String meetupId,
                                       @RequestParam String userId) {
        facade.joinMeetup(userId, meetupId);
        return ResponseEntity.ok("DEDUCTED");
    }

    @ExceptionHandler(InsufficientPointsException.class)
    public ResponseEntity<String> handleInsufficient(InsufficientPointsException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body("INSUFFICIENT_POINTS");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBad(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}
