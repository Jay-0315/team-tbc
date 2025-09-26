package com.tbc.chat.application.facade;

import com.tbc.chat.application.dto.ChatMessageDto;
import com.tbc.chat.domain.model.entity.ChatMessageEntity;
import com.tbc.chat.domain.model.ChatMessageType;
import com.tbc.chat.domain.repo.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatFacade {

    private final ChatMessageRepository repo;

    // 기존 메서드
    public ChatMessageDto sendAndPersist(Long roomId, Long userId, String content) {
        ChatMessageEntity saved = repo.save(ChatMessageEntity.builder()
                .roomId(roomId)
                .senderId(userId)
                .type(ChatMessageType.CHAT)
                .content(content)
                .build());
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDto> history(Long roomId, Long cursor, int limit) {
        var pageable = PageRequest.of(0, Math.min(Math.max(limit, 1), 100));
        var list = (cursor == null)
                ? repo.findByRoomIdOrderByIdDesc(roomId, pageable)
                : repo.findByRoomIdAndIdLessThanOrderByIdDesc(roomId, cursor, pageable);
        java.util.Collections.reverse(list); // 과거→최신으로
        return list.stream().map(this::toDto).toList();
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

    private ChatMessageDto toDto(ChatMessageEntity e) {
        return new ChatMessageDto(
                e.getId(), e.getRoomId(), e.getSenderId(),
                e.getType(), e.getContent(),
                e.getCreatedAt() != null ? e.getCreatedAt() : Instant.now()
        );
    }
}
