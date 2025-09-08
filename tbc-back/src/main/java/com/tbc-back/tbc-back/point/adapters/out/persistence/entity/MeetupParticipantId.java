package com.tbc_back.tbc_back.adapters.out.persistence.entity;

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
    @Column(name = "meetup_id", columnDefinition = "CHAR(36)")
    private String meetupId;

    @Column(name = "user_id", columnDefinition = "CHAR(36)")
    private String userId;
}
