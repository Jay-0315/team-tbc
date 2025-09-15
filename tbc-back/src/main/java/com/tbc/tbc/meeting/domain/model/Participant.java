package com.tbc.tbc.meeting.domain.model;

import com.tbc.tbc.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "meeting_participants",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "meeting_id"}))
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Participant extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, name = "user_id")
    private Long userId;

    @Column(nullable = false, name = "meeting_id")
    private Long meetingId;

    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status {
        JOINED, CANCELLED
    }
}
