package com.tbc.tbc.point.adapters.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class MeetupParticipantId implements Serializable {

    @Column(name = "meeting_id")
    private Long meetupId;   // 🔥 String → Long

    @Column(name = "user_id")
    private Long userId;     // 🔥 String → Long
}
