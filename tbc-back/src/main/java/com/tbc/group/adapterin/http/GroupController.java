// tbc-back/src/main/java/com/tbc/group/adapterin/http/GroupController.java
package com.tbc.group.adapterin.http;

import com.tbc.group.adapterin.http.dto.GroupCreateRequest;
import com.tbc.group.adapterin.http.dto.GroupCreateResponse;
import com.tbc.group.application.facade.GroupFacade;
import com.tbc.group.application.facade.GroupReadFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupFacade groupFacade;          // 생성/참가 등 쓰기 파사드
    private final GroupReadFacade groupReadFacade;  // 읽기 파사드(채팅방 ID 조회)

    @PostMapping
    public GroupCreateResponse create(@RequestBody GroupCreateRequest req) {
        // 🔹 임시: 로그인 구현 전까지는 hostId = 1L 로 고정
        Long id = groupFacade.createGroup(req, 1L);
        return new GroupCreateResponse(id);
    }

    public record ChatRoomRes(Long roomId) {}

    @GetMapping("/{groupId}/chat-room")
    public ChatRoomRes getChatRoom(@PathVariable Long groupId) {
        // 🔹 임시: 유저 검증 생략
        Long roomId = groupReadFacade.getChatRoomId(groupId);
        return new ChatRoomRes(roomId);
    }
}











//    @PostMapping
//    public GroupCreateResponse create(@RequestBody GroupCreateRequest req,
//                                      @RequestAttribute("userId") Long hostId) {
//        Long id = groupFacade.createGroup(req, hostId);
//        return new GroupCreateResponse(id);
//    }
//
//    // DTO용 내부 레코드 (매핑 애노테이션 붙이지 마세요)
//    public record ChatRoomRes(Long roomId) {}
//
//    @GetMapping("/{groupId}/chat-room")
//    public ChatRoomRes getChatRoom(@PathVariable Long groupId,
//                                   @RequestAttribute("userId") Long userId) {
//        // TODO: 필요 시 groupId-userId 멤버십 검증
//        Long roomId = groupReadFacade.getChatRoomId(groupId);
//        return new ChatRoomRes(roomId);
//    }
//}
