package com.tbc.events.application.service;

import com.tbc.events.domain.model.Event;
import com.tbc.events.domain.model.EventReview;
import com.tbc.events.domain.repository.EventRepo;
import com.tbc.events.domain.repository.EventReviewRepo;
import com.tbc.events.web.dto.ReviewCreateReq;
import com.tbc.events.web.dto.ReviewDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewService {
    private final EventRepo eventRepo;
    private final EventReviewRepo reviewRepo;

    public ReviewService(EventRepo eventRepo, EventReviewRepo reviewRepo) {
        this.eventRepo = eventRepo;
        this.reviewRepo = reviewRepo;
    }

    public Page<ReviewDTO> list(Long eventId, Pageable pageable) {
        return reviewRepo.findByEvent_Id(eventId, pageable).map(ReviewDTO::from);
    }

    @Transactional
    public ReviewDTO create(Long userId, Long eventId, ReviewCreateReq req) {
        if (userId == null) {
            throw new org.springframework.security.access.AccessDeniedException("인증이 필요합니다.");
        }
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 이벤트입니다."));
        EventReview r = new EventReview();
        r.setEvent(event);
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



