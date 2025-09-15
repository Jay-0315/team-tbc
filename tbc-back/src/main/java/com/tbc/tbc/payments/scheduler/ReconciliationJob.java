package com.tbc.tbc.payments.scheduler;

import com.tbc.tbc.payments.service.MonitoringService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReconciliationJob {

    private final MonitoringService monitoringService;

    // 매일 새벽 3시 실행 (cron = 초 분 시 일 월 요일)
    @Scheduled(cron = "0 0 3 * * *")
    public void runDailyCheck() {
        String report = monitoringService.checkConsistency();
        log.info("=== Daily Wallet Consistency Check ===\n{}", report);
    }
}
