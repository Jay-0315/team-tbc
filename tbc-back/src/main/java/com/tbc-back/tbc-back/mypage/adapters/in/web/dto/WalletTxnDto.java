package com.tbc_back.tbc_back.mypage.adapters.in.web.dto;

import lombok.*;
import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WalletTxnDto {
    private String id;
    private String type;           // 예: TOPUP, JOIN_DEBIT ...
    private String status;         // PENDING, SUCCEEDED ...
    private long amountPoints;
    private String meetupId;       // 관련 모임(있으면)
    private String externalRef;    // 외부 참조(있으면)
    private String description;    // 메모
    private Instant createdAt;
}
