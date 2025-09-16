package com.tbc.events.application.service;

import com.tbc.events.domain.model.EventStatus;
import com.tbc.events.domain.model.Event;
import com.tbc.events.domain.repository.EventRepo;
import com.tbc.events.domain.repository.FavoriteRepo;
import com.tbc.events.web.dto.EventCardDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class EventService {

    private final EventRepo eventRepo;
    private final FavoriteRepo favoriteRepo;

    public EventService(EventRepo eventRepo, FavoriteRepo favoriteRepo) {
        this.eventRepo = eventRepo;
        this.favoriteRepo = favoriteRepo;
    }

    public Page<EventCardDTO> list(Long userId, String q, String category, EventStatus status, String sort, Pageable pageable) {
        String normalizedCategory = (category == null || category.isBlank()) ? null : category;
        String normalizedQuery = (q == null || q.isBlank()) ? null : q.trim();
        
        // 디버그 로그 추가
        System.out.println("EventService.list - q: '" + q + "', normalizedQuery: '" + normalizedQuery + "'");
        
        if ("REVIEWS_DESC".equalsIgnoreCase(sort)) {
            Pageable p = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
            return eventRepo.findListOrderByReviewCountDesc(normalizedQuery, normalizedCategory, status, p)
                    .map(e -> EventCardDTO.from(e, userId != null ? Boolean.FALSE : null));
        }
        Sort s = mapSort(sort);
        Pageable p = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), s);
        return eventRepo.findList(normalizedQuery, normalizedCategory, status, p)
                .map(e -> EventCardDTO.from(e, userId != null ? Boolean.FALSE : null));
    }

    private Sort mapSort(String sort) {
        if ("DEADLINE_ASC".equalsIgnoreCase(sort) || "START_ASC".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.ASC, "startAt");
        }
        if ("REVIEWS_DESC".equalsIgnoreCase(sort)) {
            // 별도 쿼리(findListOrderByReviewCountDesc)에서 처리
            return Sort.unsorted();
        }
        // CREATED_DESC, NEW_DESC: createdAt desc
        return Sort.by(Sort.Direction.DESC, "createdAt");
    }

    public Event getByIdOrThrow(Long id) {
        return eventRepo.findById(id)
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
        Event e = getByIdOrThrow(eventId);
        int remaining = Math.max(0, e.getCapacity() - e.getJoined());
        if (qty <= remaining) {
            e.setJoined(e.getJoined() + qty);
            return com.tbc.events.web.dto.JoinRes.of("APPLIED", e.getJoined(), Math.max(0, e.getCapacity() - e.getJoined()));
        } else {
            // 대기 등록 처리
            return com.tbc.events.web.dto.JoinRes.of("WAITLISTED", e.getJoined(), remaining);
        }
    }
}



