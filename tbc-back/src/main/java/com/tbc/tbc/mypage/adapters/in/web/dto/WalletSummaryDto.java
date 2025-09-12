package com.tbc_back.tbc_back.mypage.adapters.in.web.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WalletSummaryDto {
    private String walletId;
    private long balancePoints;
}
