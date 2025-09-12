package com.tbc.group.domain.model;

import java.util.List;

public record Group(
        Long id,
        String title,
        String category,
        String topic,
        int minParticipants,
        int maxParticipants,
        Mode mode,
        FeeType feeType,
        Integer feeAmount,
        String feeInfo,
        List<String> tags,
        String contentHtml,
        Long hostId
) {
    public static Group create(
            String title,
            String category,
            String topic,
            int minParticipants,
            int maxParticipants,
            Mode mode,
            FeeType feeType,
            Integer feeAmount,
            String feeInfo,
            List<String> tags,
            String contentHtml,
            Long hostId
    ) {
        return new Group(
                null, title, category, topic,
                minParticipants, maxParticipants, mode,
                feeType, feeAmount, feeInfo,
                tags, contentHtml, hostId
        );
    }


public enum Mode {ONLINE, OFFLINE}
    public enum FeeType {FREE, PAID}
}