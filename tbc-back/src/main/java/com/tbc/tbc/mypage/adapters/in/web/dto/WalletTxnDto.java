// WalletTxnDto.java
package com.tbc.tbc.mypage.adapters.in.web.dto;

import lombok.*;
import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WalletTxnDto {
    private Long id;              // String → Long
    private String type;          // 예: TOPUP, JOIN_DEBIT ...
    private String status;        // PENDING, SUCCEEDED ...
    private long amountPoints;
    private String meetupId;        // String → Long
    private String externalRef;
    private String description;
    private Instant createdAt;
}
