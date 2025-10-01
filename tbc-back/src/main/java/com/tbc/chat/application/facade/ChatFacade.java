package com.tbc.chat.application.facade;

import com.tbc.chat.application.dto.ChatMessageDto;
import com.tbc.chat.application.dto.ParticipantInfo;
import com.tbc.chat.domain.model.entity.ChatMessageEntity;
import com.tbc.chat.domain.model.entity.ChatRoomPresence;
import com.tbc.chat.domain.model.ChatMessageType;
import com.tbc.chat.domain.repo.ChatMessageRepository;
import com.tbc.chat.domain.repo.ChatRoomPresenceRepository;
import com.tbc.profile.application.service.ProfileService;
import com.tbc.profile.domain.model.Profile;
import com.tbc.group.adapterout.persistence.jpa.repository.GroupMemberJpaRepository;
import com.tbc.group.adapterout.persistence.jpa.entity.GroupMemberEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatFacade {

    private final ChatMessageRepository repo;
    private final ChatRoomPresenceRepository presenceRepo;
    private final ProfileService profileService;
    private final GroupMemberJpaRepository groupMemberRepo;

    // ✅ 메시지 전송 + 프로필 정보 포함
    public ChatMessageDto sendAndPersist(Long roomId, Long userId, String content) {
        // 프로필 정보 조회
        Optional<Profile> profile = profileService.findByUserId(userId);
        String nickname = profile.map(Profile::displayName).orElse("사용자 " + userId);
        
        // ✅ 프로필 이미지는 저장하지 않음 (길이 문제 회피, 실시간 조회로 처리)

        ChatMessageEntity saved = repo.save(ChatMessageEntity.builder()
                .roomId(roomId)
                .senderId(userId)
                .senderNickname(nickname)
                .senderProfileImage(null)  // 항상 null로 저장
                .type(ChatMessageType.CHAT)
                .content(content)
                .readByJson(null)
                .build());
        
        // DTO 변환 시 프로필 이미지 추가 (실시간 조회)
        String profileImage = profile.map(Profile::profileImageUrl).orElse(null);
        return new ChatMessageDto(
            saved.getId(),
            saved.getRoomId(),
            saved.getSenderId(),
            nickname,
            profileImage,  // 실시간으로 추가
            saved.getType(),
            saved.getContent(),
            saved.getCreatedAt(),
            saved.getReadBy()
        );
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDto> history(Long roomId, Long cursor, int limit) {
        var pageable = PageRequest.of(0, Math.min(Math.max(limit, 1), 100));
        var list = (cursor == null)
                ? repo.findByRoomIdOrderByIdDesc(roomId, pageable)
                : repo.findByRoomIdAndIdLessThanOrderByIdDesc(roomId, cursor, pageable);
        java.util.Collections.reverse(list); // 과거→최신으로
        
        // ✅ 각 메시지에 프로필 이미지 실시간 조회
        return list.stream().map(msg -> {
            Optional<Profile> profile = profileService.findByUserId(msg.getSenderId());
            String profileImage = profile.map(Profile::profileImageUrl).orElse(null);
            
            return new ChatMessageDto(
                msg.getId(),
                msg.getRoomId(),
                msg.getSenderId(),
                msg.getSenderNickname(),
                profileImage,  // 실시간 조회
                msg.getType(),
                msg.getContent(),
                msg.getCreatedAt(),
                msg.getReadBy()
            );
        }).toList();
    }

    // ✅ 추가 메서드
    public Long createRoomIfAbsentByGroup(Long groupId) {
        // TODO: 채팅방 생성/조회 로직 구현
        return groupId; // 임시
    }

    public Long findRoomIdByGroupId(Long groupId) {
        // TODO: groupId로 채팅방 ID 조회
        return groupId; // 임시
    }

    public void addMember(Long roomId, Long userId) {
        // TODO: 채팅방에 유저 추가
    }

    public void saveSystemMessage(Long roomId, String content) {
        // TODO: 시스템 메시지 저장
        repo.save(ChatMessageEntity.builder()
                .roomId(roomId)
                .senderId(0L) // 시스템 메시지: senderId = 0
                .type(ChatMessageType.SYSTEM)
                .content(content)
                .build());
    }

    // ✅ 읽음 상태 처리 (단일 메시지)
    public void markAsRead(Long roomId, Long userId, String messageIdStr) {
        try {
            Long messageId = Long.parseLong(messageIdStr);
            repo.findById(messageId).ifPresent(msg -> {
                msg.addReadBy(userId);
                repo.save(msg);
            });
        } catch (NumberFormatException e) {
            // 임시 메시지 ID (temp-{timestamp})는 무시
        }
    }

    // ✅ 채팅방 전체 메시지 읽음 처리 (채팅방 입장 시 사용)
    @Transactional
    public int markAllAsRead(Long roomId, Long userId) {
        List<ChatMessageEntity> messages = repo.findByRoomId(roomId);
        int count = 0;
        
        System.out.println("📖 [markAllAsRead] roomId=" + roomId + ", userId=" + userId + ", 총 메시지=" + messages.size());
        
        for (ChatMessageEntity msg : messages) {
            // 내가 보낸 메시지가 아니고, 아직 읽지 않은 메시지만 처리
            if (msg.getSenderId() != null && !msg.getSenderId().equals(userId)) {
                List<Long> readBy = msg.getReadBy();
                boolean alreadyRead = readBy != null && readBy.contains(userId);
                
                System.out.println("  📨 메시지 ID=" + msg.getId() + 
                    ", 발신자=" + msg.getSenderId() + 
                    ", readBy=" + readBy + 
                    ", alreadyRead=" + alreadyRead);
                
                if (!alreadyRead) {
                    msg.addReadBy(userId);
                    repo.save(msg);
                    count++;
                    System.out.println("    ✅ 읽음 처리 완료 - 새 readBy=" + msg.getReadBy());
                }
            }
        }
        
        System.out.println("✅ [markAllAsRead] 총 " + count + "개 메시지 읽음 처리 완료");
        return count;
    }

    // ✅ Presence 관리
    public void updatePresence(Long roomId, Long userId, String status) {
        ChatRoomPresence presence = presenceRepo.findByIdUserIdAndIdRoomId(userId, roomId)
            .orElse(ChatRoomPresence.create(userId, roomId, status));
        presence.setPresenceStatus(status);
        presenceRepo.save(presence);
    }

    // ✅ 채팅방 참여자 목록 조회 (프로필 + 온라인 상태) - 배치 최적화
    @Transactional(readOnly = true)
    public List<ParticipantInfo> getParticipants(Long roomId) {
        // 1. 그룹 멤버 조회
        List<GroupMemberEntity> members = groupMemberRepo.findByGroupIdAndStatus(roomId, "ACTIVE");
        if (members.isEmpty()) {
            return List.of();
        }
        
        // 2. 모든 userId 추출
        List<Long> userIds = members.stream()
            .map(GroupMemberEntity::getUserId)
            .toList();
        
        // 3. 프로필 배치 조회 (N+1 해결)
        List<Profile> profiles = userIds.stream()
            .map(profileService::findByUserId)
            .filter(Optional::isPresent)
            .map(Optional::get)
            .toList();
        
        Map<Long, Profile> profileMap = profiles.stream()
            .collect(Collectors.toMap(Profile::userId, p -> p));
        
        // 4. Presence 배치 조회
        List<ChatRoomPresence> presences = presenceRepo.findByIdRoomId(roomId);
        Map<Long, ChatRoomPresence> presenceMap = presences.stream()
            .collect(Collectors.toMap(p -> p.getId().getUserId(), p -> p));
        
        // 5. 조합
        return members.stream().map(member -> {
            Long userId = member.getUserId();
            Profile profile = profileMap.get(userId);
            String displayName = profile != null ? profile.displayName() : "사용자 " + userId;
            String profileImage = profile != null ? profile.profileImageUrl() : null;
            
            ChatRoomPresence presence = presenceMap.get(userId);
            String presenceStatus = presence != null ? presence.getPresenceStatus() : "OFFLINE";
            Instant lastSeen = presence != null ? presence.getLastSeenAt() : null;
            
            return new ParticipantInfo(
                userId,
                displayName,
                profileImage,
                member.getRole(),
                presenceStatus,
                lastSeen,
                member.getJoinedAt()
            );
        }).collect(Collectors.toList());
    }

    // ✅ 온라인 참여자 수
    @Transactional(readOnly = true)
    public int getOnlineCount(Long roomId) {
        return (int) presenceRepo.countByIdRoomIdAndPresenceStatus(roomId, "ONLINE");
    }

    // ✅ 사용자 온라인 상태 조회 (모든 채팅방 통합)
    @Transactional(readOnly = true)date=short  findst
    public boolean isUserOnline(Long userId) {
        // 해당 사용자가 어느 채팅방이든 ONLINE 상태면 true
        List<ChatRoomPresence> userPresences = presenceRepo.findByIdUserId(userId);
        boolean isOnline = userPresences.stream()
            .anyMatch(p -> "ONLINE".equals(p.getPresenceStatus()));
        
        System.out.println("👤 [isUserOnline] userId=" + userId + ", presences=" + userPresences.size() + ", isOnline=" + isOnline);
        return isOnline;
    }

    // ✅ 안읽은 메시지 수 조회
    @Transactional(readOnly = true)
    public int getUnreadCount(Long roomId, Long userId) {
        List<ChatMessageEntity> messages = repo.findByRoomId(roomId);
        
        int unreadCount = (int) messages.stream()
            .filter(msg -> msg.getSenderId() != null && !msg.getSenderId().equals(userId))  // 내가 보낸 메시지 제외
            .filter(msg -> {
                List<Long> readBy = msg.getReadBy();
                return readBy == null || !readBy.contains(userId);  // 내가 읽지 않은 메시지
            })
            .count();
        
        System.out.println("🔢 [getUnreadCount] roomId=" + roomId + ", userId=" + userId + 
            ", 총 메시지=" + messages.size() + ", 안읽은=" + unreadCount);
        
        return unreadCount;
    }

    // ✅ 채팅방의 가장 최신 메시지 조회
    @Transactional(readOnly = true)
    public ChatMessageDto getLatestMessage(Long roomId) {
        var pageable = PageRequest.of(0, 1);
        var messages = repo.findByRoomIdOrderByIdDesc(roomId, pageable);
        
        if (messages.isEmpty()) {
            return null;
        }
        
        ChatMessageEntity latest = messages.get(0);
        
        // 프로필 이미지 실시간 조회
        Optional<Profile> profile = profileService.findByUserId(latest.getSenderId());
        String profileImage = profile.map(Profile::profileImageUrl).orElse(null);
        
        return new ChatMessageDto(
            latest.getId(),
            latest.getRoomId(),
            latest.getSenderId(),
            latest.getSenderNickname(),
            profileImage,
            latest.getType(),
            latest.getContent(),
            latest.getCreatedAt(),
            latest.getReadBy()
        );
    }

    private ChatMessageDto toDto(ChatMessageEntity e) {
        // ✅ 프로필 이미지는 실시간 조회 (DB에 저장 안 함)
        Optional<Profile> profile = profileService.findByUserId(e.getSenderId());
        String profileImage = profile.map(Profile::profileImageUrl).orElse(null);
        
        return new ChatMessageDto(
                e.getId(),
                e.getRoomId(),
                e.getSenderId(),
                e.getSenderNickname(),
                profileImage,  // 실시간 조회
                e.getType(),
                e.getContent(),
                e.getCreatedAt() != null ? e.getCreatedAt() : Instant.now(),
                e.getReadBy()
        );
    }
}
