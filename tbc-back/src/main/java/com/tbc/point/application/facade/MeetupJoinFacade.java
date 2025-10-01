package com.tbc.point.application.facade;

import com.tbc.group.application.port.out.GroupMemberRepository;
import com.tbc.point.application.port.in.DeductPointUseCase;
import com.tbc.point.domain.model.Meetup;
import com.tbc.point.domain.repository.MeetupRepository;
import com.tbc.point.adapters.in.web.dto.ParticipantResponse;
import com.tbc.point.application.exception.AlreadyJoinedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MeetupJoinFacade {

    private final MeetupRepository meetupRepository;
    private final DeductPointUseCase deductPointUseCase;
    private final GroupMemberRepository groupMemberRepository;

    @Transactional
    public void joinMeetup(Long userId, Long meetupId) { // String → Long
        // ⬇️ 중복 참가 방지
        if (groupMemberRepository.existsActiveMember(meetupId, userId)) {
            throw new AlreadyJoinedException(); // 409로 매핑할 예정
        }

        Meetup meetup = meetupRepository.findById(meetupId)
                .orElseThrow(() -> new IllegalArgumentException("Meetup not found: " + meetupId));

        if (!meetup.isJoinableStatus()) {
            throw new IllegalStateException("MEETUP_NOT_OPEN");
        }

        if (!meetup.hasCapacityLeft()) {
            throw new IllegalStateException("MEETUP_FULL");
        }

        int cost = meetup.getParticipationCost();
        String externalRef = "join-" + meetupId + "-" + userId;

        // 1) 포인트 차감 (무료 모임은 차감 생략)
        if (cost > 0) {
            deductPointUseCase.deduct(userId, meetupId, cost, externalRef, "MEETUP_JOIN");
        }

        // 2) 참가자 등록
        groupMemberRepository.addMember(meetupId, userId);
        meetupRepository.incrementJoined(meetupId); // joined 카운트 + 1
    }

    // ⬇️ 참가자 목록 조회
    @Transactional(readOnly = true)
    public List<ParticipantResponse> listMembers(Long meetupId, boolean excludeCancelled) { // String → Long
        List<GroupMemberRepository.MemberView> members = excludeCancelled
                ? groupMemberRepository.findMembersByStatus(meetupId, "ACTIVE")
                : groupMemberRepository.findMembers(meetupId);
        return members.stream()
                .map(m -> new ParticipantResponse(m.userId(), m.role(), m.status(), m.joinedAt()))
                .toList();
    }
}
