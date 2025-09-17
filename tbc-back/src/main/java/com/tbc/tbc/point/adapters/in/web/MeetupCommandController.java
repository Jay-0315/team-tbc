package com.tbc.tbc.point.adapters.in.web;

import com.tbc.tbc.point.adapters.in.web.dto.CreateMeetupRequest;
import com.tbc.tbc.point.adapters.out.persistence.MeetupParticipantPersistenceAdapter;
import com.tbc.tbc.point.adapters.out.persistence.entity.MeetupEntity;
import com.tbc.tbc.point.adapters.out.persistence.jpa.SpringDataMeetupJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/meetups")
@RequiredArgsConstructor
public class MeetupCommandController {

    private final SpringDataMeetupJpaRepository meetupRepo;
    private final MeetupParticipantPersistenceAdapter participantAdapter;

    // 개발 편의용: 모임 생성 시 호스트를 참가자로도 자동 등록
    @PostMapping
    @Transactional
    public ResponseEntity<Long> create(@RequestBody CreateMeetupRequest req) {
        MeetupEntity m = new MeetupEntity();
        m.setHostId(req.getHostId());
        m.setTitle(req.getTitle());
        m.setDescription(req.getDescription());
        m.setLocation(req.getLocation());
        m.setIsLocationPublic(req.getIsLocationPublic());
        m.setCapacityMax(req.getCapacityMax() == null ? 0 : req.getCapacityMax());
        m.setPricePoints(req.getPricePoints() == null ? 0 : req.getPricePoints());
        m.setPlatformFeeRate(req.getPlatformFeeRate());
        m.setStatus(req.getStatus() == null ? "OPEN" : req.getStatus());
        m.setStartAt(req.getStartAt());
        m.setEndAt(req.getEndAt());

        MeetupEntity saved = meetupRepo.save(m);

        // 호스트를 참가자로 자동 등록 (중복 체크 내장)
        if (!participantAdapter.existsActive(saved.getId(), req.getHostId())) {
            participantAdapter.save(saved.getId(), req.getHostId(), "HOST", "CONFIRMED");
        }

        return ResponseEntity.ok(saved.getId());
    }
}


