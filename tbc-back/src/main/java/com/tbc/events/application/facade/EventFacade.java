package com.tbc.events.application.facade;

import com.tbc.events.application.service.EventService;
import com.tbc.events.application.service.ReviewService;
import com.tbc.events.domain.model.EventStatus;
import com.tbc.events.web.dto.*;
import com.tbc.group.adapterout.persistence.jpa.entity.GroupEntity;
import com.tbc.group.adapterout.persistence.jpa.repository.GroupMemberJpaRepository;
import com.tbc.login.adapter.out.persistence.UserJpaRepository;
import com.tbc.login.domain.User;
import com.tbc.profile.adapterin.persistence.jpa.entity.ProfileEntity;
import com.tbc.profile.adapterin.persistence.jpa.repository.ProfileJpaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class EventFacade {
    
    @Autowired
    private EventService eventService;
    
    @Autowired
    private ReviewService reviewService;
    
        @Autowired
        private UserJpaRepository userRepository;
        
        @Autowired
        private ProfileJpaRepository profileRepository;
        
        @Autowired
        private GroupMemberJpaRepository groupMemberJpaRepository;
    
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
        
        // 실제 참여자 수 계산
        int actualJoinedCount = groupMemberJpaRepository.countByGroupIdAndStatus(id, "ACTIVE");
        
        // 호스트 정보 조회
        Long hostId = event.getHostId();
        String hostName = "TEAM-TBC"; // 기본값
        String hostNickname = null;
        String hostProfileImage = null;
        
        if (hostId != null) {
            Optional<User> userOpt = userRepository.findById(hostId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                hostNickname = user.getNickname();
                
                // 프로필 정보 조회
                Optional<ProfileEntity> profileOpt = profileRepository.findByUserId(hostId);
                if (profileOpt.isPresent()) {
                    ProfileEntity profile = profileOpt.get();
                    hostName = profile.getDisplayName() != null ? profile.getDisplayName() : user.getNickname();
                    hostProfileImage = profile.getProfileImageUrl();
                } else {
                    hostName = user.getNickname();
                }
            }
        }
        
        EventDetailDTO dto = EventDetailDTO.fromGroupEntity(event, null, null, hostName, hostNickname, hostProfileImage);
        // 실제 참여자 수로 업데이트
        dto.joined = actualJoinedCount;
        dto.remainingSeats = Math.max(0, event.getCapacity() - actualJoinedCount);
        
        return dto;
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
