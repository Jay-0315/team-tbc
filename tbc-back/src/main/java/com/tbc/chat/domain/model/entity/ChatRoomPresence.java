package com.tbc.chat.domain.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;

/**
 * 채팅방 온라인 상태 관리
 * Discord 스타일: ONLINE, AWAY, OFFLINE
 */
@Entity
@Table(name = "chat_room_presence",
    indexes = {
        @Index(name = "idx_room_status", columnList = "room_id, presence_status"),
        @Index(name = "idx_user_room", columnList = "user_id, room_id")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomPresence {

    @EmbeddedId
    private PresenceId id;

    @Column(name = "presence_status", nullable = false, length = 16)
    private String presenceStatus;  // "ONLINE", "AWAY", "OFFLINE"

    @UpdateTimestamp
    @Column(name = "last_seen_at")
    private Instant lastSeenAt;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class PresenceId implements java.io.Serializable {
        private static final long serialVersionUID = 1L;

        @Column(name = "user_id")
        private Long userId;

        @Column(name = "room_id")
        private Long roomId;
    }

    // ✅ 헬퍼 메서드
    public static ChatRoomPresence create(Long userId, Long roomId, String status) {
        return ChatRoomPresence.builder()
            .id(new PresenceId(userId, roomId))
            .presenceStatus(status)
            .build();
    }

    public boolean isOnline() {
        return "ONLINE".equals(presenceStatus);
    }

    public boolean isAway() {
        return "AWAY".equals(presenceStatus);
    }
}

