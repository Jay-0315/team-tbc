package com.tbc.payments.adapter.in.scheduler;

import com.tbc.group.application.port.out.GroupRepository;
import com.tbc.payments.application.facade.PaymentsFacade;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class GroupSettlementScheduler {
    private static final Logger log = LoggerFactory.getLogger(GroupSettlementScheduler.class);

    private final GroupRepository groupRepo;
    private final PaymentsFacade paymentsFacade;

    // 매 1분마다 실행, 최대 100건 처리 (필요 시 조정)
    @Scheduled(fixedDelay = 60_000L, initialDelay = 30_000L)
    public void settleDueGroups() {
        LocalDateTime now = LocalDateTime.now();
        List<Long> due = groupRepo.findDuePaidGroupIds(now, 100);
        if (due.isEmpty()) return;
        for (Long groupId : due) {
            try {
                paymentsFacade.settleGroup(groupId);
                // 상태 업데이트는 서비스 내부에서 hold 처리 후, 리포지토리로 반영하거나 여기서 표시
                groupRepo.markSettlement(groupId, "SETTLED"); // 실제 결과에 따라 SETTLED/REFUNDED로 구분하려면 서비스가 결과를 반환하게 바꿔도 됨
            } catch (Exception e) {
                log.warn("Failed to settle group {}: {}", groupId, e.getMessage());
            }
        }
    }
}


