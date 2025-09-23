package com.tbc.tbc.point.adapters.in.web.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
public class CreateMeetupRequest {
    private Long hostId;
    private String title;
    private String description;
    private String location;
    private Boolean isLocationPublic;
    private Integer capacityMax;
    private Integer pricePoints;
    private BigDecimal platformFeeRate;
    private String status; // OPEN/FINISHED/CLOSED 등
    private Instant startAt;
    private Instant endAt;
}


