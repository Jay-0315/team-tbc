package com.tbc.group.adapterin.http;

import com.tbc.common.util.JwtUtils;
import com.tbc.common.util.UserUtils;
import com.tbc.group.adapterin.http.dto.GroupCreateRequest;
import com.tbc.group.adapterin.http.dto.GroupCreateResponse;
import com.tbc.group.adapterin.http.dto.GroupCardDTO;
import com.tbc.group.application.facade.GroupFacade;
import com.tbc.group.application.facade.GroupReadFacade;
import com.tbc.group.application.port.out.GroupMemberRepository;
import com.tbc.login.domain.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupFacade groupFacade;          // 생성/참가 등 쓰기 파사드
    private final GroupReadFacade groupReadFacade;  // 읽기 파사드(채팅방 ID 조회)
    private final UserUtils userUtils;              // 사용자 유틸리티
    private final UserService userService;          // 사용자 서비스
    private final GroupMemberRepository memberRepository;
    private final JwtUtils jwtUtils;

    @PostMapping
    public GroupCreateResponse create(@RequestBody GroupCreateRequest req,
                                      @RequestHeader("X-User-Id") Long hostId) {
        System.out.println("Received group creation request: " + req);
        System.out.println("Host ID: " + hostId);
        Long id = groupFacade.createGroup(req, hostId);
        System.out.println("Created group with ID: " + id);
        return new GroupCreateResponse(id);
    }

    // 본인만 신청: 수량 입력 제거, 즉시 MEMBER로 등록
    @PostMapping("/{groupId}/join")
    public ResponseEntity<Void> join(@PathVariable Long groupId, HttpServletRequest request) {
        Long userId = jwtUtils.getUserIdFromRequest(request);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            memberRepository.addMember(groupId, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public Page<GroupCardDTO> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String q,  // 검색어
            @RequestParam(required = false) String category,  // 카테고리 필터
            @RequestParam(required = false, defaultValue = "NEW_DESC") String sort  // 정렬
    ) {
        // 정렬 옵션에 따라 Pageable 생성
        Pageable pageable;
        if ("NEW_DESC".equals(sort) || "CREATED_DESC".equals(sort)) {
            pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.DESC, "createdAt"
            ));
        } else {
            pageable = PageRequest.of(page, size);
        }
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
