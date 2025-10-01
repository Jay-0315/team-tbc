package com.tbc.chat.application.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PresenceService {

    private final Map<Long, Map<Long, Integer>> presence = new ConcurrentHashMap<>();
    public int join(Long roomId, Long userId) {
        var room = presence.computeIfAbsent(roomId, k -> new ConcurrentHashMap<>());
        room.merge(userId, 1, Integer::sum);
        return total(roomId);
    }

    public int leave(Long roomId, Long userId) {
        var room = presence.get(roomId);
        if (room == null) return 0;
        room.computeIfPresent(userId, (k, v) -> v > 1 ? v - 1 : null);
        if (room.isEmpty()) presence.remove(roomId);
        return total(roomId);
    }
    public int total(Long roomId) {
        var room = presence.get(roomId);
        if (room == null) return 0;
        return room.values().stream().mapToInt(i -> i).sum();
    }
}
