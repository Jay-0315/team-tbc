package com.tbc.events.application.service;

import com.tbc.events.domain.model.EventReview;
import com.tbc.events.domain.repository.EventReviewRepo;
import com.tbc.events.web.dto.ReviewCreateReq;
import com.tbc.events.web.dto.ReviewDTO;
import com.tbc.events.web.dto.ReviewUpdateReq;
import com.tbc.group.adapterout.persistence.jpa.entity.GroupEntity;
import com.tbc.group.adapterout.persistence.jpa.repository.GroupJpaRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewService {
    private final GroupJpaRepository groupRepository;
    private final EventReviewRepo reviewRepo;
    private final JdbcTemplate jdbcTemplate;

    @PersistenceContext
    private EntityManager entityManager;

    public ReviewService(GroupJpaRepository groupRepository, EventReviewRepo reviewRepo, JdbcTemplate jdbcTemplate) {
        this.groupRepository = groupRepository;
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
        
        // 이벤트 존재 확인
        Integer exists = jdbcTemplate.queryForObject(
                "select count(1) from events where id = ?",
                Integer.class,
                eventId
        );
        if (exists == null || exists == 0) {
            throw new IllegalArgumentException("존재하지 않는 이벤트입니다.");
        }

        // GroupEntity 프록시 참조로 FK 매핑
        GroupEntity eventRef = entityManager.getReference(GroupEntity.class, eventId);
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

    @Transactional
    public ReviewDTO update(Long userId, Long eventId, Long reviewId, ReviewUpdateReq req) {
        if (userId == null) {
            throw new org.springframework.security.access.AccessDeniedException("인증이 필요합니다.");
        }
        
        EventReview review = reviewRepo.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("후기를 찾을 수 없습니다."));
        
        // 이벤트 일치 확인
        if (!review.getEvent().getId().equals(eventId)) {
            throw new IllegalArgumentException("해당 이벤트의 후기가 아닙니다.");
        }
        
        // 작성자 권한 확인
        if (!review.getUserId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("후기를 수정할 권한이 없습니다.");
        }
        
        review.setRating(req.rating);
        review.setComment(req.comment);
        EventReview updated = reviewRepo.save(review);
        return ReviewDTO.from(updated);
    }

    @Transactional
    public void delete(Long userId, Long eventId, Long reviewId) {
        if (userId == null) {
            throw new org.springframework.security.access.AccessDeniedException("인증이 필요합니다.");
        }
        
        EventReview review = reviewRepo.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("후기를 찾을 수 없습니다."));
        
        // 이벤트 일치 확인
        if (!review.getEvent().getId().equals(eventId)) {
            throw new IllegalArgumentException("해당 이벤트의 후기가 아닙니다.");
        }
        
        // 작성자 권한 확인
        if (!review.getUserId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("후기를 삭제할 권한이 없습니다.");
        }
        
        reviewRepo.delete(review);
    }
}
