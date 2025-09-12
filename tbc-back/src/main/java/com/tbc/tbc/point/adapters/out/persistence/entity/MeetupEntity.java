package com.tbc_back.tbc_back.adapters.out.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "meetups")
@Getter @Setter
public class MeetupEntity {

    @Id
    @Column(name = "id", columnDefinition = "CHAR(36)")
    private String id;

    @Column(name = "host_id", columnDefinition = "CHAR(36)", nullable = false)
    private String hostId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "start_at")
    private Instant startAt;

    @Column(name = "end_at")
    private Instant endAt;

    @Column(name = "location")
    private String location;

    @Column(name = "is_location_public")
    private Boolean isLocationPublic;

    @Column(name = "capacity_max", nullable = false)
    private int capacityMax;

    @Column(name = "price_points", nullable = false)
    private int pricePoints;

    @Column(name = "platform_fee_rate", precision = 5, scale = 2, nullable = false)
    private java.math.BigDecimal platformFeeRate;

    @Column(name = "status", nullable = false)
    private String status; // Enum 대신 String 매핑 (OPEN, FINISHED 등)

    @Column(name = "created_at")
    private Instant createdAt;

    // 참가자 목록 연관관계
    @OneToMany(mappedBy = "meetup", fetch = FetchType.LAZY)
    private List<MeetupParticipantEntity> participants = new ArrayList<>();
}
