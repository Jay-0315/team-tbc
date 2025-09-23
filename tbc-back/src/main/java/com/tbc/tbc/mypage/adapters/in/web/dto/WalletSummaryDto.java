// WalletSummaryDto.java
package com.tbc.tbc.mypage.adapters.in.web.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WalletSummaryDto {
    private Long walletId;        // String → Long
    private long balancePoints;
}
