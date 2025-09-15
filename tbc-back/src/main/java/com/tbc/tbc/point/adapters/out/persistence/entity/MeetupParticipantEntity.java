package com.tbc.tbc.point.adapters.out.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "meetup_participants")
@Getter
@Setter
public class MeetupParticipantEntity {

    @EmbeddedId
    private MeetupParticipantId id;

    // 🔥 모임 연관관계 (MeetupEntity)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meetup_id", insertable = false, updatable = false)
    private MeetupEntity meetup;

    // 🔥 유저 연관관계 (UserEntity)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private UserEntity user;

    @Column(name = "role", length = 20, nullable = false)
    private String role = "ATTENDEE";

    @Column(name = "status", length = 20, nullable = false)
    private String status = "PENDING";

    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt = Instant.now();
}
