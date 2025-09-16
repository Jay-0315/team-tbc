package com.tbc.events.application.facade;

import com.tbc.events.application.service.EventService;
import com.tbc.events.application.service.ReviewService;
import com.tbc.events.domain.model.Event;
import com.tbc.events.domain.model.EventReview;
import com.tbc.events.web.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventFacade {
    
    @Autowired
    private EventService eventService;
    
    @Autowired
    private ReviewService reviewService;
    
    /**
     * 이벤트 목록 조회 - 파사드 패턴으로 외부 인터페이스 제공
     */
    public Page<EventCardDTO> getEventList(String q, String category, String status, String sort, Pageable pageable) {
        com.tbc.events.domain.model.EventStatus eventStatus = null;
        if (status != null) {
            try {
                eventStatus = com.tbc.events.domain.model.EventStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                // Invalid status, keep as null
            }
        }
        return eventService.list(null, q, category, eventStatus, sort, pageable);
    }
    
    /**
     * 이벤트 상세 조회
     */
    public EventDetailDTO getEventDetail(Long id) {
        var event = eventService.getByIdOrThrow(id);
        return EventDetailDTO.from(event, null, java.util.List.of("react","frontend"), "TEAM-TBC");
    }
    
    /**
     * 이벤트 참여
     */
    public JoinRes joinEvent(Long id, JoinReq joinReq) {
        return eventService.join(null, id, joinReq.getQty());
    }
    
    /**
     * 이벤트 리뷰 목록 조회
     */
    public Page<ReviewDTO> getEventReviews(Long eventId, Pageable pageable) {
        return reviewService.list(eventId, pageable);
    }
    
    /**
     * 이벤트 리뷰 생성
     */
    public ReviewDTO createEventReview(Long eventId, ReviewCreateReq reviewCreateReq, Long userId) {
        return reviewService.create(userId, eventId, reviewCreateReq);
    }
    
    /**
     * 이벤트 즐겨찾기 토글
     */
    public FavoriteResponse toggleFavorite(Long eventId, Long userId) {
        boolean favorited = eventService.toggleFavorite(userId, eventId);
        return new FavoriteResponse(favorited);
    }
}
