// application/service/GroupCommandService.java
package com.tbc.group.application.service;

import com.tbc.group.adapterin.http.dto.GroupCreateRequest;
import com.tbc.group.application.port.out.GroupMemberRepository;
import com.tbc.group.application.port.out.GroupRepository;
import com.tbc.group.domain.event.GroupCreatedEvent;
import com.tbc.group.domain.model.Group;
import com.tbc.group.domain.model.Group.FeeType;
import com.tbc.group.domain.model.Group.Mode;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class GroupCommandService {
    private final GroupRepository groupRepo;
    private final GroupMemberRepository memberRepo;
    private final ApplicationEventPublisher events;

    @Transactional
    public Long create(GroupCreateRequest req, Long hostId) {
        // 검증
        if (req.minParticipants() == null || req.maxParticipants() == null ||
                req.minParticipants() < 1 || req.maxParticipants() < req.minParticipants())
            throw new IllegalArgumentException("invalid participants range");
        if ("PAID".equals(req.feeType()) && (req.feeAmount() == null || req.feeAmount() < 0))
            throw new IllegalArgumentException("fee required");

        var group = Group.create(
                req.title(), req.category(), req.topic(),
                req.minParticipants(), req.maxParticipants(),
                Mode.valueOf(req.mode()),
                FeeType.valueOf(req.feeType()),
                req.feeAmount(), req.feeInfo(),
                req.tags(), req.contentHtml(),
                hostId
        );

        Long groupId = groupRepo.save(group);
        memberRepo.addHost(groupId, hostId);

        // 커밋 후 채팅 생성
        events.publishEvent(new GroupCreatedEvent(groupId, hostId));
        return groupId;
    }
}
