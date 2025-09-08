package com.tbc_back.tbc_back.adapters.out.persistence.entity;

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

    @Column(name = "role", length = 20, nullable = false)
    private String role = "ATTENDEE";

    @Column(name = "status", length = 20, nullable = false)
    private String status = "PENDING";

    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt = Instant.now();
}
