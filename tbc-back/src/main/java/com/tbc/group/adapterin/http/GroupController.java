package com.tbc.group.adapterin.http;

import com.tbc.common.util.UserUtils;
import com.tbc.group.adapterin.http.dto.GroupCreateRequest;
import com.tbc.group.adapterin.http.dto.GroupCreateResponse;
import com.tbc.group.adapterin.http.dto.GroupCardDTO;
import com.tbc.group.application.facade.GroupFacade;
import com.tbc.group.application.facade.GroupReadFacade;
import com.tbc.login.domain.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupFacade groupFacade;          // 생성/참가 등 쓰기 파사드
    private final GroupReadFacade groupReadFacade;  // 읽기 파사드(채팅방 ID 조회)
    private final UserUtils userUtils;              // 사용자 유틸리티
    private final UserService userService;          // 사용자 서비스

    @PostMapping
    public GroupCreateResponse create(@RequestBody GroupCreateRequest req,
                                      @RequestHeader("X-User-Id") Long hostId) {
        Long id = groupFacade.createGroup(req, hostId);
        return new GroupCreateResponse(id);
    }

    @GetMapping
    public Page<GroupCardDTO> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String q,  // 검색어
            @RequestParam(required = false) String category  // 카테고리 필터
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return groupReadFacade.findAll(pageable, q, category);
    }

    @GetMapping("/my-groups")
    public Page<GroupCardDTO> getMyGroups(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest request
    ) {
        String email = userUtils.getEmailFromRequest(request);
        if (email == null) {
            throw new IllegalArgumentException("사용자 인증이 필요합니다.");
        }
        
        var user = userService.findByEmailOptional(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        Pageable pageable = PageRequest.of(page, size);
        return groupReadFacade.findByUserId(user.getId(), pageable);
    }

    @GetMapping("/{groupId}")
    public GroupCardDTO getOne(@PathVariable Long groupId) {
        return groupReadFacade.findOne(groupId);
    }

    public record ChatRoomRes(Long roomId) {}

    @GetMapping("/{groupId}/chat-room")
    public ChatRoomRes getChatRoom(@PathVariable Long groupId,
                                   @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        // TODO: 필요 시 groupId-userId 멤버십 검증 (userId가 null일 수 있음)
        Long roomId = groupReadFacade.getChatRoomId(groupId);
        return new ChatRoomRes(roomId);
    }
}
