package com.tbc.chat.domain.model.entity;

import com.tbc.chat.domain.model.ChatMessageType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "chat_message")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long roomId;
    private Long senderId;

    @Enumerated(EnumType.STRING)
    private ChatMessageType type;

    @Column(length = 1000)
    private String content;

    @CreationTimestamp
    private Instant createdAt;

    // ✅ 추가: 전송자 정보 캐시 (프로필 조회 성능 개선)
    @Column(length = 200)
    private String senderNickname;

    @Column(length = 500)
    private String senderProfileImage;

    // ✅ 추가: 읽음 상태 (JSON 배열: "[1, 2, 3]")
    @Column(columnDefinition = "JSON")
    private String readByJson;

    // ✅ JSON 변환 헬퍼 메서드
    @Transient
    public List<Long> getReadBy() {
        if (readByJson == null || readByJson.isEmpty() || readByJson.equals("[]") || readByJson.equals("null")) {
            return List.of();
        }
        try {
            return Arrays.stream(readByJson.replace("[", "").replace("]", "").split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Long::parseLong)
                .toList();
        } catch (Exception e) {
            return List.of();
        }
    }

    public void addReadBy(Long userId) {
        List<Long> current = new ArrayList<>(getReadBy());
        if (!current.contains(userId)) {
            current.add(userId);
            // JSON 배열 형식으로 저장: [1,2,3]
            this.readByJson = "[" + current.stream()
                .map(String::valueOf)
                .reduce((a, b) -> a + "," + b)
                .orElse("") + "]";
        }
    }
    
    // ✅ NULL 체크 헬퍼
    @PrePersist
    @PreUpdate
    public void ensureDefaults() {
        if (readByJson == null) {
            readByJson = "[]";
        }
    }
}