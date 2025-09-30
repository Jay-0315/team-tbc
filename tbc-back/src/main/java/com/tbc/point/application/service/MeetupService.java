package com.tbc.point.application.service;

import com.tbc.group.application.port.out.GroupMemberRepository;
import com.tbc.point.adapters.in.web.dto.CreateMeetupRequest;
import com.tbc.point.domain.model.Meetup;
import com.tbc.point.domain.repository.MeetupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MeetupService {

    private final MeetupRepository meetupRepository; // 도메인 repo (PersistenceAdapter 구현체 있음)
    private final GroupMemberRepository groupMemberRepository;

    @Transactional
    public Long createMeetup(CreateMeetupRequest req) {
        Meetup meetup = new Meetup(
                null,
                req.getHostId(),
                req.getTitle(),
                req.getTopic() == null ? req.getTitle() : req.getTopic(),
                req.getCategory() == null ? "MEETUP" : req.getCategory(),
                req.getFeeAmount(),
                req.getFeeType() == null ? "POINT" : req.getFeeType(),
                req.getCapacity() == null ? 0 : req.getCapacity(),
                req.getMaxParticipants(),
                req.getMinParticipants(),
                req.getJoined() == null ? 0 : req.getJoined(),
                req.getStatus() == null ? "OPEN" : req.getStatus(),
                req.getMode() == null ? "OFFLINE" : req.getMode(),
                req.getLocation(),
                req.getCoverUrl(),
                req.getDescription(),
                req.getFeeInfo(),
                req.getTagsCsv(),
                req.getContentHtml(),
                req.getCreatedAt() == null ? LocalDateTime.now() : req.getCreatedAt(),
                req.getUpdatedAt() == null ? LocalDateTime.now() : req.getUpdatedAt()
        );

        Long meetupId = meetupRepository.save(meetup); // Domain repo 통해 저장

        // 호스트 자동 참가 등록
        if (!groupMemberRepository.existsActiveMember(meetupId, req.getHostId())) {
            groupMemberRepository.addHost(meetupId, req.getHostId());
        }

        return meetupId;
    }
}
