package com.tbc.chat.domain.port;

public interface MembershipPort {
    /** userId가 roomId의 정회원(참가자/호스트)인지 여부 */
    boolean isMember(Long roomId, Long userId);
}