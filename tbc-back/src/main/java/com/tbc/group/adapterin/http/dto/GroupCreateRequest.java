// adapterin/http/dto/GroupCreateRequest.java
package com.tbc.group.adapterin.http.dto;
import java.util.List;

public record GroupCreateRequest(
        String title,
        String category,          // ex) "SPORTS", "MUSIC" ...
        String topic,             // 자유 텍스트
        Integer minParticipants,
        Integer maxParticipants,
        String mode,              // "ONLINE" | "OFFLINE"
        String feeType,           // "FREE" | "PAID"
        Integer feeAmount,        // PAID일 때 필수
        String feeInfo,
        List<String> tags,
        String contentHtml
) {}