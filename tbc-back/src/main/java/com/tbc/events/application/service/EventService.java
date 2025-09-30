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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
        Page<GroupEntity> page = groupRepository.findAll(p, normalizedQuery, normalizedCategory);
        
        return enrichPageWithHostInfo(page, pageable, userId);
    }
    
    /**
     * N+1 문제 해결: 한번에 모든 호스트 정보와 찜 정보를 조회하여 매핑
     */
    private Page<EventCardDTO> enrichPageWithHostInfo(Page<GroupEntity> page, Pageable pageable, Long userId) {
        List<EventCardDTO> dtos = page.getContent().stream()
                .map(e -> EventCardDTO.fromGroupEntity(e, null))
                .collect(Collectors.toList());

        if (dtos.isEmpty()) {
            return new PageImpl<>(dtos, pageable, page.getTotalElements());
        }

        // 모든 eventId 수집 (찜 정보 조회용)
        List<Long> eventIds = dtos.stream()
                .map(dto -> dto.id)
                .filter(id -> id != null)
                .collect(Collectors.toList());

        // 사용자의 찜 정보 bulk 조회
        java.util.Set<Long> favoritedEventIds = new java.util.HashSet<>();
        if (userId != null && !eventIds.isEmpty()) {
            favoritedEventIds = favoriteRepo.findByUserId(userId).stream()
                    .map(fav -> fav.getEventId())
                    .collect(Collectors.toSet());
        }

        // 모든 hostId 수집
        List<Long> hostIds = dtos.stream()
                .map(dto -> dto.hostId)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());

        if (!hostIds.isEmpty()) {
            // 프로필 정보 bulk 조회
            Map<Long, ProfileEntity> profileMap = profileRepository.findByUserIdIn(hostIds).stream()
                    .collect(Collectors.toMap(ProfileEntity::getUserId, p -> p));

            // 프로필이 없는 사용자의 User 정보 bulk 조회
            List<Long> missingProfileIds = hostIds.stream()
                    .filter(id -> !profileMap.containsKey(id))
                    .collect(Collectors.toList());

            Map<Long, User> userMap = missingProfileIds.isEmpty() ? Map.of() :
                    userRepository.findByIdIn(missingProfileIds).stream()
                            .collect(Collectors.toMap(User::getId, u -> u));

            // DTO에 호스트 정보 매핑
            final java.util.Set<Long> finalFavoritedEventIds = favoritedEventIds;
            dtos.forEach(dto -> {
                // 찜 정보 설정
                if (userId != null && dto.id != null) {
                    dto.favorited = finalFavoritedEventIds.contains(dto.id);
                }
                
                // 호스트 정보 설정
                if (dto.hostId != null) {
                    ProfileEntity profile = profileMap.get(dto.hostId);
                    if (profile != null) {
                        dto.hostNickname = profile.getDisplayName();
                        dto.hostProfileImage = profile.getProfileImageUrl();
                    } else {
                        User user = userMap.get(dto.hostId);
                        if (user != null) {
                            dto.hostNickname = user.getNickname() != null ? user.getNickname() : user.getRealName();
                        }
                    }
                }
            });
        }

        return new PageImpl<>(dtos, pageable, page.getTotalElements());
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

    /**
     * 찜한 이벤트 목록 조회
     */
    public Page<EventCardDTO> findFavoriteEvents(Long userId, Pageable pageable) {
        try {
            System.out.println("=== findFavoriteEvents START - userId: " + userId);
            
            if (userId == null) {
                throw new org.springframework.security.access.AccessDeniedException("인증이 필요합니다.");
            }
            
            // 사용자가 찜한 이벤트 ID 목록 조회
            List<com.tbc.events.domain.model.Favorite> favorites = favoriteRepo.findByUserId(userId);
            System.out.println("=== Favorites found: " + favorites.size());
            
            if (favorites.isEmpty()) {
                System.out.println("=== No favorites found, returning empty page");
                return new PageImpl<>(List.of(), pageable, 0);
            }
            
            List<Long> favoriteEventIds = favorites.stream()
                    .map(fav -> fav.getEventId())
                    .collect(Collectors.toList());
            System.out.println("=== Favorite event IDs: " + favoriteEventIds);
            
            // 찜한 이벤트 ID로 이벤트 조회
            List<GroupEntity> favoriteEvents = groupRepository.findAllById(favoriteEventIds);
            System.out.println("=== Events found from DB: " + favoriteEvents.size());
            
            // 존재하지 않는 이벤트 제거 (삭제된 이벤트 등)
            favoriteEvents = favoriteEvents.stream()
                    .filter(entity -> entity != null && entity.getId() != null)
                    .collect(Collectors.toList());
            System.out.println("=== Events after filtering: " + favoriteEvents.size());
            
            if (favoriteEvents.isEmpty()) {
                System.out.println("=== No valid events found, returning empty page");
                return new PageImpl<>(List.of(), pageable, 0);
            }
            
            // 페이징 처리
            int start = (int) pageable.getOffset();
            int total = favoriteEvents.size();
            System.out.println("=== Paging - start: " + start + ", total: " + total + ", pageSize: " + pageable.getPageSize());
            
            // start가 total보다 크면 빈 페이지 반환
            if (start >= total) {
                System.out.println("=== Start >= total, returning empty page with total count");
                return new PageImpl<>(List.of(), pageable, total);
            }
            
            int end = Math.min((start + pageable.getPageSize()), total);
            List<GroupEntity> pagedEvents = favoriteEvents.subList(start, end);
            System.out.println("=== Paged events count: " + pagedEvents.size());
            
            Page<GroupEntity> page = new PageImpl<>(pagedEvents, pageable, total);
            Page<EventCardDTO> result = enrichPageWithHostInfo(page, pageable, userId);
            System.out.println("=== findFavoriteEvents END - returning " + result.getContent().size() + " items");
            return result;
            
        } catch (Exception e) {
            System.err.println("=== ERROR in findFavoriteEvents: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
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
