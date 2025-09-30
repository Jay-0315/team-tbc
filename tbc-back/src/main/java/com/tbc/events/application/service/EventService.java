package com.tbc.events.application.service;

import com.tbc.events.domain.model.EventStatus;
import com.tbc.events.domain.repository.FavoriteRepo;
import com.tbc.events.web.dto.EventCardDTO;
import com.tbc.group.adapterout.persistence.jpa.entity.GroupEntity;
import com.tbc.group.adapterout.persistence.jpa.repository.GroupJpaRepository;
import com.tbc.profile.adapterin.persistence.jpa.entity.ProfileEntity;
import com.tbc.profile.adapterin.persistence.jpa.repository.ProfileJpaRepository;
import com.tbc.login.adapter.out.persistence.UserJpaRepository;
import com.tbc.login.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class EventService {

    private final GroupJpaRepository groupRepository;
    private final FavoriteRepo favoriteRepo;
    private final ProfileJpaRepository profileRepository;
    private final UserJpaRepository userRepository;

    public EventService(GroupJpaRepository groupRepository, FavoriteRepo favoriteRepo, 
                       ProfileJpaRepository profileRepository, UserJpaRepository userRepository) {
        this.groupRepository = groupRepository;
        this.favoriteRepo = favoriteRepo;
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    public Page<EventCardDTO> list(Long userId, String q, String category, EventStatus status, String sort, Pageable pageable) {
        String normalizedCategory = (category == null || category.isBlank()) ? null : category;
        String normalizedQuery = (q == null || q.isBlank()) ? null : q.trim();
        
        System.out.println("EventService.list - q: '" + q + "', normalizedQuery: '" + normalizedQuery + "'");
        
        Sort s = mapSort(sort);
        Pageable p = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), s);
        return groupRepository.findAll(p, normalizedQuery, normalizedCategory)
                .map(e -> enrichWithHostInfo(EventCardDTO.fromGroupEntity(e, null)));
    }
    
    private EventCardDTO enrichWithHostInfo(EventCardDTO dto) {
        if (dto.hostId == null) {
            return dto;
        }
        
        // 프로필 정보 조회
        profileRepository.findByUserId(dto.hostId).ifPresent(profile -> {
            dto.hostNickname = profile.getDisplayName();
            dto.hostProfileImage = profile.getProfileImageUrl();
        });
        
        // 프로필이 없으면 User 정보에서 닉네임 가져오기
        if (dto.hostNickname == null) {
            userRepository.findById(dto.hostId).ifPresent(user -> {
                dto.hostNickname = user.getNickname() != null ? user.getNickname() : user.getRealName();
            });
        }
        
        return dto;
    }

    private Sort mapSort(String sort) {
        if ("DEADLINE_ASC".equalsIgnoreCase(sort) || "START_ASC".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.ASC, "startAt");
        }
        return Sort.by(Sort.Direction.DESC, "createdAt");
    }

    public GroupEntity getByIdOrThrow(Long id) {
        return groupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 이벤트입니다."));
    }

    @Transactional
    public boolean toggleFavorite(Long userId, Long eventId) {
        if (userId == null) {
            throw new org.springframework.security.access.AccessDeniedException("인증이 필요합니다.");
        }
        getByIdOrThrow(eventId);
        boolean exists = favoriteRepo.existsByUserIdAndEventId(userId, eventId);
        if (exists) {
            favoriteRepo.deleteByUserIdAndEventId(userId, eventId);
            return false;
        } else {
            favoriteRepo.save(new com.tbc.events.domain.model.Favorite(userId, eventId));
            return true;
        }
    }

    @Transactional
    public com.tbc.events.web.dto.JoinRes join(Long userId, Long eventId, int qty) {
        if (userId == null) {
            throw new org.springframework.security.access.AccessDeniedException("인증이 필요합니다.");
        }
        if (qty < 1) {
            throw new IllegalArgumentException("신청 수량은 1 이상이어야 합니다.");
        }
        GroupEntity e = getByIdOrThrow(eventId);
        int remaining = Math.max(0, e.getCapacity() - e.getJoined());
        if (qty <= remaining) {
            e.setJoined(e.getJoined() + qty);
            groupRepository.save(e);
            return com.tbc.events.web.dto.JoinRes.of("APPLIED", e.getJoined(), Math.max(0, e.getCapacity() - e.getJoined()));
        } else {
            return com.tbc.events.web.dto.JoinRes.of("WAITLISTED", e.getJoined(), remaining);
        }
    }

    @Transactional
    public com.tbc.events.web.dto.EventDetailDTO updateEvent(Long eventId, com.tbc.events.web.dto.EventUpdateReq updateReq, Long userId) {
        GroupEntity event = groupRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("이벤트를 찾을 수 없습니다."));
        
        if (!event.getHostId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("이벤트를 수정할 권한이 없습니다.");
        }
        
        // 필수 필드 업데이트
        event.setTitle(updateReq.title);
        event.setCategory(updateReq.category);
        event.setCapacity(updateReq.capacity);
        event.setEventDate(updateReq.eventDate);
        event.setEventTime(updateReq.eventTime);
        event.setLocation(updateReq.location);
        event.setFeeType(updateReq.feeType);
        event.setFeeAmount(updateReq.feeAmount);
        event.setFeeInfo(updateReq.feeInfo);
        event.setContentHtml(updateReq.contentHtml);
        
        // coverUrl null 체크 - null이면 기존 값 유지하거나 기본값 설정
        if (updateReq.coverUrl != null && !updateReq.coverUrl.trim().isEmpty()) {
            event.setCoverUrl(updateReq.coverUrl);
        } else if (event.getCoverUrl() == null || event.getCoverUrl().trim().isEmpty()) {
            event.setCoverUrl(""); // 기본값 설정
        }
        
        if (updateReq.eventDate != null && updateReq.eventTime != null) {
            event.setStartAt(java.time.LocalDateTime.of(updateReq.eventDate, updateReq.eventTime));
        }
        
        GroupEntity updatedEvent = groupRepository.save(event);
        return com.tbc.events.web.dto.EventDetailDTO.fromGroupEntity(updatedEvent, false, java.util.Collections.emptyList(), "호스트");
    }

    @Transactional
    public void deleteEvent(Long eventId, Long userId) {
        GroupEntity event = groupRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("이벤트를 찾을 수 없습니다."));
        
        if (!event.getHostId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("이벤트를 삭제할 권한이 없습니다.");
        }
        
        groupRepository.delete(event);
    }
}
