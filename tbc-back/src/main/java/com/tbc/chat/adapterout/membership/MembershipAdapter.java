package com.tbc.chat.adapterout.membership;

import com.tbc.chat.domain.port.MembershipPort;
import org.springframework.stereotype.Component;

@Component
public class MembershipAdapter implements MembershipPort {
    @Override
    public boolean isMember(Long roomId, Long userId) {
        // TODO: 추후 모임 서비스(REST/DB)로 교체
        return true;
    }
}
