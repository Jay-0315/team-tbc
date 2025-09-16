package com.tbc.infrastructure.config;

import com.tbc.events.domain.model.Event;
import com.tbc.events.domain.model.EventReview;
import com.tbc.events.domain.model.EventStatus;
import com.tbc.events.domain.repository.EventRepo;
import com.tbc.events.domain.repository.EventReviewRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Configuration
@Profile("local")
public class DataSeeder {

    @Value("${app.seed:false}")
    private boolean seedEnabled;

    @Value("${app.seed.always:false}")
    private boolean seedAlways;

    @Value("${app.seed.reviews:false}")
    private boolean seedReviews;

    @Bean
    CommandLineRunner seedEvents(EventRepo eventRepo) {
        return args -> {
            if (!seedEnabled) return;

            if (seedAlways) {
                eventRepo.deleteAll();
            } else if (eventRepo.count() > 0) {
                // 멱등: 데이터가 있으면 시드 생략
                return;
            }

            Random rnd = new Random(20250909);
            List<String> categories = List.of("영화","음악","운동","스터디","게임");
            List<String> locations = List.of("서울","부산","대구","인천","광주");

            for (int i = 1; i <= 40; i++) {
                Event e = new Event();
                e.setTitle("샘플 이벤트 " + i);
                e.setCoverUrl("https://picsum.photos/seed/ev" + i + "/800/400");
                e.setCategory(categories.get(rnd.nextInt(categories.size())));
                e.setStatus(EventStatus.values()[rnd.nextInt(EventStatus.values().length)]);
                e.setCapacity(30);
                e.setJoined(rnd.nextInt(21)); // 0~20
                e.setStartAt(LocalDateTime.now().plusDays(1 + rnd.nextInt(30)));
                e.setLocation(locations.get(rnd.nextInt(locations.size())));
                e.setDescription("샘플 이벤트 상세 설명 " + i);
                eventRepo.save(e);
            }
        };
    }

    @Bean
    CommandLineRunner seedEventReviews(EventRepo eventRepo, EventReviewRepo reviewRepo) {
        return args -> {
            if (!seedEnabled || !seedReviews) return;
            Random rnd = new Random(20250909);
            var all = eventRepo.findAll();
            for (Event e : all) {
                long existing = reviewRepo.countByEvent_Id(e.getId());
                if (existing > 0) continue; // 멱등: 이미 있으면 스킵
                int n = rnd.nextInt(6); // 0~5개
                for (int k = 0; k < n; k++) {
                    EventReview r = new EventReview();
                    r.setEvent(e);
                    r.setUserId(1L + rnd.nextInt(5));
                    r.setRating(3 + rnd.nextInt(3)); // 3~5
                    int len = 1 + rnd.nextInt(120);
                    StringBuilder sb = new StringBuilder();
                    while (sb.length() < len) sb.append("좋았어요! ");
                    r.setComment(sb.substring(0, len));
                    // createdAt은 엔티티 @PrePersist 에서 now로 기본 설정되지만, 최근 30일 내 랜덤으로 덮어씌움
                    var minusDays = 1 + rnd.nextInt(30);
                    var nowMinus = java.time.Instant.now().minusSeconds(minusDays * 86400L);
                    // 직접 필드 세터가 없으므로 저장 후 업데이트 대신, 리플렉션으로 세팅(로컬 시드 전용, 위험 최소화)
                    try {
                        var f = EventReview.class.getDeclaredField("createdAt");
                        f.setAccessible(true);
                        f.set(r, nowMinus);
                    } catch (Exception ignored) {}
                    reviewRepo.save(r);
                }
            }
        };
    }
}


