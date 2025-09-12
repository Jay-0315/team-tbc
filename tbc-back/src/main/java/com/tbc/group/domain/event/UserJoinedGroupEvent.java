package com.tbc.group.domain.event;

public record UserJoinedGroupEvent( Long groupId, Long userId) {
}