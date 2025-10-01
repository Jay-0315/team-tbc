package com.tbc.events.application.service;

import com.tbc.events.domain.model.EventStatus;
import com.tbc.events.domain.repository.FavoriteRepo;
import com.tbc.events.web.dto.EventCardDTO;
import com.tbc.group.adapterout.persistence.jpa.entity.GroupEntity;
import com.tbc.group.adapterout.persistence.jpa.repository.GroupJpaRepository;
import com.tbc.group.adapterout.persistence.jpa.repository.GroupMemberJpaRepository;
import com.tbc.group.application.port.out.GroupMemberRepository;
import com.tbc.profile.adapterin.persistence.jpa.repository.ProfileJpaRepository;
import com.tbc.login.adapter.out.persistence.UserJpaRepository;
import com.tbc.login.domain.User;
import com.tbc.profile.adapterin.persistence.jpa.entity.ProfileEntity;
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
    private final GroupMemberRepository groupMemberRepository;
    private final GroupMemberJpaRepository groupMemberJpaRepository;

    public EventService(GroupJpaRepository groupRepository, FavoriteRepo favoriteRepo,
                       ProfileJpaRepository profileRepository, UserJpaRepository userRepository,
                       GroupMemberRepository groupMemberRepository, GroupMemberJpaRepository groupMemberJpaRepository) {
        this.groupRepository = groupRepository;
        this.favoriteRepo = favoriteRepo;
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.groupMemberJpaRepository = groupMemberJpaRepository;
    }

    public Page<EventCardDTO> list(Long userId, String q, String category, EventStatus status, String sort, Pageable pageable) {
        String normalizedCategory = (category == null || category.isBlank()) ? null : category;
        String normalizedQuery = (q == null || q.isBlank()) ? null : q.trim();
        
        Sort s = mapSort(sort);
        Pageable p = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), s);
        
        // 1. GroupEntity 조회
        Page<GroupEntity> groupPage = groupRepository.findAll(p, normalizedQuery, normalizedCategory);
        List<GroupEntity> groups = groupPage.getContent();
        
        if (groups.isEmpty()) {
            return new PageImpl<>(List.of(), p, 0);
        }
        
        // 2. N+1 문제 해결: 배치로 User와 Profile 조회
        List<Long> hostIds = groups.stream()
                .map(GroupEntity::getHostId)
                .distinct()
                .collect(Collectors.toList());
        
        // 배치로 User 조회
        Map<Long, User> userMap = userRepository.findAllById(hostIds).stream()
                .collect(Collectors.toMap(User::getId, user -> user));
        
        // 배치로 Profile 조회
        Map<Long, ProfileEntity> profileMap = profileRepository.findByUserIdIn(hostIds).stream()
                .collect(Collectors.toMap(ProfileEntity::getUserId, profile -> profile));

        // 3. DTO 변환 (N+1 없이)
        List<EventCardDTO> dtos = groups.stream()
                .map(group -> {
                    User user = userMap.get(group.getHostId());
                    ProfileEntity profile = profileMap.get(group.getHostId());
                    
                        // 실제 참여자 수 계산
                        int actualJoinedCount = groupMemberJpaRepository.countByGroupIdAndStatus(group.getId(), "ACTIVE");
                    
                    EventCardDTO dto = EventCardDTO.fromGroupEntity(group, null);
                    // 실제 참여자 수로 업데이트
                    dto.joined = actualJoinedCount;
                    dto.remainingSeats = Math.max(0, group.getCapacity() - actualJoinedCount);
                    
                    if (user != null && profile != null) {
                        dto.hostNickname = profile.getDisplayName() != null ? profile.getDisplayName() : user.getNickname();
                        dto.hostProfileImage = profile.getProfileImageUrl();
                    } else if (user != null) {
                        dto.hostNickname = user.getNickname();
                    }
                    return dto;
                })
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, p, groupPage.getTotalElements());
    }

    private Sort mapSort(String sort) {
        if ("DEADLINE_ASC".equalsIgnoreCase(sort) || "START_ASC".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.ASC, "startAt");
        }
        if ("REVIEWS_DESC".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.DESC, "reviewCount");
        }
        if ("NEW_DESC".equalsIgnoreCase(sort) || "CREATED_DESC".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        return Sort.by(Sort.Direction.DESC, "createdAt");
    }

    public GroupEntity getByIdOrThrow(Long id) {
        return groupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("이벤트를 찾을 수 없습니다."));
    }

    @Transactional
    public com.tbc.events.web.dto.JoinRes join(Long userId, Long eventId, Integer qty) {
        GroupEntity event = getByIdOrThrow(eventId);
        
        // 현재 실제 참여자 수 확인
        int currentJoinedCount = groupMemberJpaRepository.countByGroupIdAndStatus(eventId, "ACTIVE");
        
        if (currentJoinedCount + qty > event.getCapacity()) {
            throw new IllegalArgumentException("정원을 초과할 수 없습니다.");
        }
        
        // 실제 참여자를 GroupMemberEntity에 추가
        for (int i = 0; i < qty; i++) {
            groupMemberRepository.addMember(eventId, userId);
        }
        
        // GroupEntity의 joined 필드도 동기화
        event.setJoined(currentJoinedCount + qty);
        groupRepository.save(event);
        
        int newJoinedCount = currentJoinedCount + qty;
        return com.tbc.events.web.dto.JoinRes.of("APPLIED", newJoinedCount, event.getCapacity() - newJoinedCount);
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
        event.setLatitude(updateReq.latitude);
        event.setLongitude(updateReq.longitude);
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
        return com.tbc.events.web.dto.EventDetailDTO.fromGroupEntity(updatedEvent, false, java.util.Collections.emptyList(), "호스트", null, null);
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

    /**
     * 찜한 이벤트 목록 조회
     */
    public Page<EventCardDTO> findFavoriteEvents(Long userId, Pageable pageable) {
        // 사용자가 찜한 이벤트 ID 목록 조회
        List<Long> favoriteEventIds = favoriteRepo.findByUserId(userId)
                .stream()
                .map(com.tbc.events.domain.model.Favorite::getEventId)
                .collect(Collectors.toList());
        
        if (favoriteEventIds.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }
        
        // 찜한 이벤트들 조회
        List<GroupEntity> favoriteEvents = groupRepository.findAllById(favoriteEventIds);
        
        // 호스트 정보 조회
        List<Long> hostIds = favoriteEvents.stream()
                .map(GroupEntity::getHostId)
                .distinct()
                .collect(Collectors.toList());
        
        Map<Long, ProfileEntity> profileMap = profileRepository.findAllById(hostIds)
                .stream()
                .collect(Collectors.toMap(ProfileEntity::getUserId, p -> p));
        
        Map<Long, User> userMap = userRepository.findAllById(hostIds)
                .stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        
        // EventCardDTO 변환 (모두 favorited = true)
        List<EventCardDTO> dtos = favoriteEvents.stream()
                .map(e -> {
                    ProfileEntity profile = profileMap.get(e.getHostId());
                    User user = userMap.get(e.getHostId());
                    String hostNickname = profile != null ? profile.getDisplayName() : (user != null ? user.getNickname() : null);
                    String hostProfileImage = profile != null ? profile.getProfileImageUrl() : null;
                    
                    EventCardDTO dto = EventCardDTO.fromGroupEntity(e, true); // favorited는 항상 true
                    dto.hostNickname = hostNickname;
                    dto.hostProfileImage = hostProfileImage;
                    return dto;
                })
                .collect(Collectors.toList());
        
        // 페이징 처리
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), dtos.size());
        List<EventCardDTO> pagedDtos = dtos.subList(start, end);
        
        return new PageImpl<>(pagedDtos, pageable, dtos.size());
    }

    /**
     * 이벤트 즐겨찾기 토글
     */
    @Transactional
    public boolean toggleFavorite(Long userId, Long eventId) {
        // 이벤트 존재 확인
        if (!groupRepository.existsById(eventId)) {
            throw new IllegalArgumentException("이벤트를 찾을 수 없습니다.");
        }
        
        // 이미 찜한 상태인지 확인
        boolean exists = favoriteRepo.existsByUserIdAndEventId(userId, eventId);
        
        if (exists) {
            // 찜 해제
            favoriteRepo.deleteByUserIdAndEventId(userId, eventId);
            return false;
        } else {
            // 찜하기
            com.tbc.events.domain.model.Favorite favorite = new com.tbc.events.domain.model.Favorite(userId, eventId);
            favoriteRepo.save(favorite);
            return true;
        }
    }
}