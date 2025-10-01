package com.tbc.point.adapters.in.web;

import com.tbc.point.adapters.in.web.dto.MeetupDetailResponse;
import com.tbc.point.adapters.in.web.dto.MeetupSummaryResponse;
import com.tbc.point.domain.repository.MeetupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/meetups")
@RequiredArgsConstructor
public class MeetupQueryController {

    private final MeetupRepository meetupRepo;

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(name = "status", required = false) String status) {
        if (status == null || status.equalsIgnoreCase("OPEN")) {
            return ResponseEntity.ok(
                    meetupRepo.findOpenMeetups().stream()
                            .map(MeetupSummaryResponse::from)
                            .toList()
            );
        }
        return ResponseEntity.ok(meetupRepo.findOpenMeetups().stream()
                .filter(m -> status.equalsIgnoreCase(m.getStatus()))
                .map(MeetupSummaryResponse::from)
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MeetupDetailResponse> get(@PathVariable Long id) {
        return ResponseEntity.of(
                meetupRepo.findById(id)
                        .map(MeetupDetailResponse::from)
        );
    }
}


