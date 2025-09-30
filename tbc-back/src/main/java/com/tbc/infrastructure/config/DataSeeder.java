package com.tbc.infrastructure.config;

import com.tbc.events.domain.model.EventReview;
import com.tbc.events.domain.repository.EventReviewRepo;
import com.tbc.group.adapterout.persistence.jpa.entity.GroupEntity;
import com.tbc.group.adapterout.persistence.jpa.repository.GroupJpaRepository;
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
    CommandLineRunner seedEvents(GroupJpaRepository groupRepository) {
        return args -> {
            if (!seedEnabled) return;

            if (seedAlways) {
                groupRepository.deleteAll();
            } else if (groupRepository.count() > 0) {
                return;
            }

            Random rnd = new Random(20250909);
            List<String> categories = List.of("영화","음악","운동","스터디","게임");
            List<String> locations = List.of("서울","부산","대구","인천","광주");

            for (int i = 1; i <= 40; i++) {
                GroupEntity e = new GroupEntity();
                e.setTitle("샘플 이벤트 " + i);
                e.setCoverUrl("https://picsum.photos/seed/ev" + i + "/800/400");
                e.setCategory(categories.get(rnd.nextInt(categories.size())));
                e.setTopic("샘플 주제 " + i);
                e.setMinParticipants(2);
                e.setMaxParticipants(30);
                e.setCapacity(30);
                e.setJoined(rnd.nextInt(21));
                e.setMode("OFFLINE");
                e.setFeeType("FREE");
                e.setFeeAmount(0);
                e.setLocation(locations.get(rnd.nextInt(locations.size())));
                e.setHostId(1L);
                e.setStartAt(LocalDateTime.now().plusDays(1 + rnd.nextInt(30)));
                groupRepository.save(e);
            }
        };
    }

    @Bean
    CommandLineRunner seedEventReviews(GroupJpaRepository groupRepository, EventReviewRepo reviewRepo) {
        return args -> {
            if (!seedEnabled || !seedReviews) return;
            Random rnd = new Random(20250909);
            var all = groupRepository.findAll();
            for (GroupEntity e : all) {
                long existing = reviewRepo.countByEvent_Id(e.getId());
                if (existing > 0) continue;
                int n = rnd.nextInt(6);
                for (int k = 0; k < n; k++) {
                    EventReview r = new EventReview();
                    r.setEvent(e);
                    r.setUserId(1L + rnd.nextInt(5));
                    r.setRating(3 + rnd.nextInt(3));
                    int len = 1 + rnd.nextInt(120);
                    StringBuilder sb = new StringBuilder();
                    while (sb.length() < len) sb.append("좋았어요! ");
                    r.setComment(sb.substring(0, len));
                    var minusDays = 1 + rnd.nextInt(30);
                    var nowMinus = java.time.Instant.now().minusSeconds(minusDays * 86400L);
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
