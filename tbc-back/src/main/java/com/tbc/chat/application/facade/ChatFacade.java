package com.tbc.chat.application.facade;

import com.tbc.chat.application.dto.ChatMessageDto;
import com.tbc.chat.domain.entity.ChatMessageEntity;
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

    private ChatMessageDto toDto(ChatMessageEntity e) {
        return new ChatMessageDto(
                e.getId(), e.getRoomId(), e.getSenderId(),
                e.getType(), e.getContent(),
                e.getCreatedAt() != null ? e.getCreatedAt() : Instant.now()
        );
    }
}
