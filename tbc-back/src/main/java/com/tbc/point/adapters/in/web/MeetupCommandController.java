package com.tbc.point.adapters.in.web;

import com.tbc.point.adapters.in.web.dto.CreateMeetupRequest;
import com.tbc.point.application.service.MeetupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/meetups")
@RequiredArgsConstructor
public class MeetupCommandController {

    private final MeetupService meetupService;

    @PostMapping
    public ResponseEntity<Long> create(@RequestBody CreateMeetupRequest req) {
        Long id = meetupService.createMeetup(req);
        return ResponseEntity.ok(id);
    }
}
