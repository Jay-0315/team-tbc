package com.tbc.events.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "JoinRes")
public class JoinRes {
    @Schema(description = "신청 결과 상태", example = "APPLIED")
    public String state; // APPLIED | WAITLISTED

    @Schema(description = "현재 참가자 수", example = "12")
    public int joined;

    @Schema(description = "남은 좌석 수", example = "88")
    public int remainingSeats;

    public static JoinRes of(String state, int joined, int remainingSeats) {
        JoinRes r = new JoinRes();
        r.state = state;
        r.joined = joined;
        r.remainingSeats = remainingSeats;
        return r;
    }
}





