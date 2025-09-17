package com.tbc.tbc.point.adapters.in.web;

import com.tbc.tbc.point.adapters.out.persistence.entity.MeetupEntity;
import com.tbc.tbc.point.adapters.out.persistence.jpa.SpringDataMeetupJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/meetups")
@RequiredArgsConstructor
public class MeetupQueryController {

    private final SpringDataMeetupJpaRepository meetupRepo;

    @GetMapping("/{id}")
    public ResponseEntity<MeetupEntity> get(@PathVariable Long id) {
        return ResponseEntity.of(meetupRepo.findById(id));
    }
}


