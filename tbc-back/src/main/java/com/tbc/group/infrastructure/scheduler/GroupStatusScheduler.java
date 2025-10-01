package com.tbc.group.infrastructure.scheduler;

import com.tbc.group.adapterout.persistence.jpa.entity.GroupEntity;
import com.tbc.group.adapterout.persistence.jpa.repository.GroupJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class GroupStatusScheduler {

    private final GroupJpaRepository groupRepo;

    /**
     * 매 시간마다 실행: 시작 시간이 지났고 최소 인원이 미달된 소셜링을 CLOSED로 변경
     */
    @Scheduled(cron = "0 0 * * * *")  // 매 시간 정각에 실행
    @Transactional
    public void closeUnderMinimumGroups() {
        LocalDateTime now = LocalDateTime.now();
        
        log.info("=== GroupStatusScheduler: Checking groups to close ===");
        log.info("Current time: {}", now);
        
        // OPEN 상태이면서 시작 시간이 지난 그룹 조회
        List<GroupEntity> groups = groupRepo.findAll().stream()
                .filter(g -> "OPEN".equals(g.getStatus()))
                .filter(g -> g.getStartAt() != null && g.getStartAt().isBefore(now))
                .toList();
        
        log.info("Found {} OPEN groups with start time passed", groups.size());
        
        int closedCount = 0;
        
        for (GroupEntity group : groups) {
            // 최소 인원 체크
            if (group.getJoined() < group.getMinParticipants()) {
                log.info("Closing group {}: {} (joined: {}, minParticipants: {})",
                        group.getId(), group.getTitle(), group.getJoined(), group.getMinParticipants());
                
                group.setStatus("CLOSED");
                groupRepo.save(group);
                closedCount++;
            }
        }
        
        log.info("=== GroupStatusScheduler completed: {} groups closed ===", closedCount);
    }
}

