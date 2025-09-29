package com.tbc.events.application.service;

import com.tbc.events.domain.model.Event;
import com.tbc.events.domain.model.EventReview;
import com.tbc.events.domain.repository.EventRepo;
import com.tbc.events.domain.repository.EventReviewRepo;
import com.tbc.events.web.dto.ReviewCreateReq;
import com.tbc.events.web.dto.ReviewDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewService {
    private final EventRepo eventRepo;
    private final EventReviewRepo reviewRepo;
    private final JdbcTemplate jdbcTemplate;

    @PersistenceContext
    private EntityManager entityManager;

    public ReviewService(EventRepo eventRepo, EventReviewRepo reviewRepo, JdbcTemplate jdbcTemplate) {
        this.eventRepo = eventRepo;
        this.reviewRepo = reviewRepo;
        this.jdbcTemplate = jdbcTemplate;
    }

    public Page<ReviewDTO> list(Long eventId, Pageable pageable) {
        return reviewRepo.findByEvent_Id(eventId, pageable).map(ReviewDTO::from);
    }

    @Transactional
    public ReviewDTO create(Long userId, Long eventId, ReviewCreateReq req) {
        if (userId == null) {
            throw new org.springframework.security.access.AccessDeniedException("인증이 필요합니다.");
        }
        // 존재 여부만 확인 (events 테이블 기준). 스키마 불일치로 인한 컬럼 select를 피한다
        Integer exists = jdbcTemplate.queryForObject(
                "select count(1) from events where id = ?",
                Integer.class,
                eventId
        );
        if (exists == null || exists == 0) {
            throw new IllegalArgumentException("존재하지 않는 이벤트입니다.");
        }

        // 실제 엔티티 로딩 없이 프록시 참조만 설정하여 FK를 매핑
        Event eventRef = entityManager.getReference(Event.class, eventId);
        EventReview r = new EventReview();
        r.setEvent(eventRef);
        r.setUserId(userId);
        r.setRating(req.rating);
        r.setComment(req.comment);
        EventReview saved = reviewRepo.save(r);
        return ReviewDTO.from(saved);
    }

    public Stats getStats(Long eventId) {
        long count = reviewRepo.countByEvent_Id(eventId);
        Double avg = reviewRepo.avgRatingByEventId(eventId);
        return new Stats(count, avg == null ? 0.0 : avg);
    }

    public record Stats(long count, double avg) {}
}



