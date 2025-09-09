package com.tbc_back.tbc_back.domain.repository;

import com.tbc_back.tbc_back.adapters.in.web.dto.ParticipantResponse;
import java.util.List;

public interface MeetupParticipantRepository {
    boolean existsActive(String meetupId, String userId);     // 취소가 아닌 상태로 이미 참가했는지
    List<ParticipantResponse> findParticipants(String meetupId, boolean excludeCancelled);

    // 이미 join에서 저장은 구현되어 있을 테니 save는 생략
}
