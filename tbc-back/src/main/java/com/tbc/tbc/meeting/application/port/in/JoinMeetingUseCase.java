package com.tbc.tbc.meeting.application.port.in;

public interface JoinMeetingUseCase {
    void join(Long userId, Long meetingId);
    boolean canEnterChat(Long userId, Long meetingId);
}
