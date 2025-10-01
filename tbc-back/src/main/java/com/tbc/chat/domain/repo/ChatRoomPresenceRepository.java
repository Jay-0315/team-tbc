package com.tbc.chat.domain.repo;

import com.tbc.chat.domain.model.entity.ChatRoomPresence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomPresenceRepository extends JpaRepository<ChatRoomPresence, ChatRoomPresence.PresenceId> {

    // 특정 채팅방의 모든 presence 조회
    List<ChatRoomPresence> findByIdRoomId(Long roomId);

    // 특정 채팅방의 특정 상태 사용자들
    List<ChatRoomPresence> findByIdRoomIdAndPresenceStatus(Long roomId, String status);

    // 온라인 사용자 수
    long countByIdRoomIdAndPresenceStatus(Long roomId, String status);

    // 특정 사용자의 presence 조회
    Optional<ChatRoomPresence> findByIdUserIdAndIdRoomId(Long userId, Long roomId);

    // 특정 사용자의 모든 채팅방 presence 조회
    List<ChatRoomPresence> findByIdUserId(Long userId);

    // 특정 사용자의 모든 채팅방 presence 삭제 (로그아웃 시)
    @Modifying
    @Query("DELETE FROM ChatRoomPresence p WHERE p.id.userId = :userId")
    void deleteAllByUserId(Long userId);

    // 특정 채팅방에서 사용자 제거
    void deleteByIdUserIdAndIdRoomId(Long userId, Long roomId);
}

