package com.tbc.tbc.meeting.adapter.in.websoket;

import com.tbc.tbc.meeting.application.port.in.JoinMeetingUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final JoinMeetingUseCase joinMeetingUseCase;

    @MessageMapping("/chat/{meetingId}")
    public void enterChat(@DestinationVariable Long meetingId,
                          @AuthenticationPrincipal(expression = "id") Long userId) {
        if (!joinMeetingUseCase.canEnterChat(meetingId, userId)) {
            throw new SecurityException("참가자 아닙니다. 채팅방 입장 불가");
        }
    }
}
