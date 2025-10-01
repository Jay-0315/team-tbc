package com.tbc.chat.domain.repo;

import com.tbc.chat.domain.model.entity.ChatMessageEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {
    List<ChatMessageEntity> findByRoomIdOrderByIdDesc(Long roomId, Pageable pageable);
    List<ChatMessageEntity> findByRoomIdAndIdLessThanOrderByIdDesc(Long roomId, Long cursor, Pageable pageable);
    
    // ✅ 안읽은 메시지 수 조회용 (페이징 없이 모든 메시지)
    List<ChatMessageEntity> findByRoomId(Long roomId);
}
