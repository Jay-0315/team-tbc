package com.tbc.chat.domain.model.entity;

import com.tbc.chat.domain.model.ChatMessageType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;

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

}