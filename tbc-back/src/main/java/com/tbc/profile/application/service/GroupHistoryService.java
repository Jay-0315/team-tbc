package com.tbc.profile.application.service;

import com.tbc.profile.adapterin.http.dto.GroupHistoryResponse;
import com.tbc.group.adapterout.persistence.jpa.repository.GroupJpaRepository;
import com.tbc.group.adapterout.persistence.jpa.repository.GroupMemberJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GroupHistoryService {
    
    private final GroupJpaRepository groupJpaRepository;
    private final GroupMemberJpaRepository groupMemberJpaRepository;
    
    public List<GroupHistoryResponse> getCurrentGroups(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        return groupMemberJpaRepository.findByUserId(userId)
            .stream()
            .map(member -> groupJpaRepository.findById(member.getGroupId()).orElse(null))
            .filter(group -> group != null && group.getStartAt() != null && group.getStartAt().isAfter(now))
            .map(group -> new GroupHistoryResponse(
                group.getId(),
                group.getTitle(),
                group.getCategory(),
                group.getLocation(),
                group.getStartAt(),
                group.getCapacity(),
                group.getJoined(),
                determineStatus(group.getStartAt(), group.getJoined(), group.getCapacity()),
                "MEMBER",
                group.getCreatedAt()
            ))
            .toList();
    }
    
    public List<GroupHistoryResponse> getPastGroups(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        return groupMemberJpaRepository.findByUserId(userId)
            .stream()
            .map(member -> groupJpaRepository.findById(member.getGroupId()).orElse(null))
            .filter(group -> group != null && group.getStartAt() != null && group.getStartAt().isBefore(now))
            .map(group -> new GroupHistoryResponse(
                group.getId(),
                group.getTitle(),
                group.getCategory(),
                group.getLocation(),
                group.getStartAt(),
                group.getCapacity(),
                group.getJoined(),
                "ENDED",
                "MEMBER",
                group.getCreatedAt()
            ))
            .toList();
    }
    
    public List<GroupHistoryResponse> getCreatedGroups(Long userId) {
        return groupJpaRepository.findByHostId(userId)
            .stream()
            .map(group -> new GroupHistoryResponse(
                group.getId(),
                group.getTitle(),
                group.getCategory(),
                group.getLocation(),
                group.getStartAt(),
                group.getCapacity(),
                group.getJoined(),
                determineStatus(group.getStartAt(), group.getJoined(), group.getCapacity()),
                "HOST",
                group.getCreatedAt()
            ))
            .toList();
    }
    
    private String determineStatus(LocalDateTime startAt, Integer joined, Integer capacity) {
        LocalDateTime now = LocalDateTime.now();
        
        if (startAt.isBefore(now)) {
            return "ENDED";
        } else if (joined >= capacity * 0.9) {
            return "FULL";
        } else if (joined >= capacity * 0.7) {
            return "ALMOST_FULL";
        } else {
            return "ACTIVE";
        }
    }
}
