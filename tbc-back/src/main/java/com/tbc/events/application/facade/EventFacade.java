package com.tbc.events.application.facade;

import com.tbc.events.application.service.EventService;
import com.tbc.events.application.service.ReviewService;
import com.tbc.events.domain.model.EventStatus;
import com.tbc.events.web.dto.*;
import com.tbc.group.adapterout.persistence.jpa.entity.GroupEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class EventFacade {
    
    @Autowired
    private EventService eventService;
    
    @Autowired
    private ReviewService reviewService;
    
    /**
     * 이벤트 목록 조회 - 파사드 패턴으로 외부 인터페이스 제공
     */
    public Page<EventCardDTO> getEventList(Long userId, String q, String category, String status, String sort, Pageable pageable) {
        EventStatus eventStatus = null;
        if (status != null) {
            try {
                eventStatus = EventStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                // Invalid status, keep as null
            }
        }
        return eventService.list(userId, q, category, eventStatus, sort, pageable);
    }
    
    /**
     * 이벤트 상세 조회
     */
    public EventDetailDTO getEventDetail(Long id) {
        GroupEntity event = eventService.getByIdOrThrow(id);
        return EventDetailDTO.fromGroupEntity(event, null, null, "TEAM-TBC");
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
     * 찜한 이벤트 목록 조회
     */
    public Page<EventCardDTO> getFavoriteEvents(Long userId, Pageable pageable) {
        return eventService.findFavoriteEvents(userId, pageable);
    }

    /**
     * 이벤트 즐겨찾기 토글
     */
    public FavoriteResponse toggleFavorite(Long eventId, Long userId) {
        boolean favorited = eventService.toggleFavorite(userId, eventId);
        return new FavoriteResponse(favorited);
    }

    /**
     * 이벤트 수정 - 본인 작성 이벤트만 수정 가능
     */
    public EventDetailDTO updateEvent(Long eventId, EventUpdateReq updateReq, Long userId) {
        return eventService.updateEvent(eventId, updateReq, userId);
    }

    /**
     * 이벤트 삭제 - 본인 작성 이벤트만 삭제 가능
     */
    public void deleteEvent(Long eventId, Long userId) {
        eventService.deleteEvent(eventId, userId);
    }

    /**
     * 이벤트 리뷰 수정 - 본인 작성 리뷰만 수정 가능
     */
    public ReviewDTO updateReview(Long eventId, Long reviewId, ReviewUpdateReq req, Long userId) {
        return reviewService.update(userId, eventId, reviewId, req);
    }

    /**
     * 이벤트 리뷰 삭제 - 본인 작성 리뷰만 삭제 가능
     */
    public void deleteReview(Long eventId, Long reviewId, Long userId) {
        reviewService.delete(userId, eventId, reviewId);
    }
}
