package com.tbc.events.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class JoinReq {
    
    @NotNull(message = "신청 수량은 필수입니다")
    @Min(value = 1, message = "신청 수량은 1 이상이어야 합니다")
    private Integer qty;

    public JoinReq() {}

    public JoinReq(Integer qty) {
        this.qty = qty;
    }

    public Integer getQty() {
        return qty;
    }

    public void setQty(Integer qty) {
        this.qty = qty;
    }
}
