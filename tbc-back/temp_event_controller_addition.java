        @PutMapping("/{id}")
        @Operation(summary = "이벤트 수정", description = "본인이 작성한 이벤트를 수정합니다.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "수정 성공"),
                        @ApiResponse(responseCode = "403", description = "권한 없음"),
                        @ApiResponse(responseCode = "404", description = "이벤트를 찾을 수 없음")
        })
        public com.tbc.events.web.dto.EventDetailDTO updateEvent(
                        @PathVariable Long id,
                        @RequestBody @Valid com.tbc.events.web.dto.EventUpdateReq updateReq,
                        Authentication authentication) {
                Long userId = null;
                if (authentication != null && authentication.isAuthenticated()) {
                        String email = authentication.getName();
                        User user = userService.findByEmailOptional(email)
                                        .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException(
                                                        "사용자를 찾을 수 없습니다."));
                        userId = user.getId();
                }
                return eventFacade.updateEvent(id, updateReq, userId);
        }

        @DeleteMapping("/{id}")
        @Operation(summary = "이벤트 삭제", description = "본인이 작성한 이벤트를 삭제합니다.")
        @ApiResponses({
                        @ApiResponse(responseCode = "204", description = "삭제 성공"),
                        @ApiResponse(responseCode = "403", description = "권한 없음"),
                        @ApiResponse(responseCode = "404", description = "이벤트를 찾을 수 없음")
        })
        public ResponseEntity<Void> deleteEvent(
                        @PathVariable Long id,
                        Authentication authentication) {
                Long userId = null;
                if (authentication != null && authentication.isAuthenticated()) {
                        String email = authentication.getName();
                        User user = userService.findByEmailOptional(email)
                                        .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException(
                                                        "사용자를 찾을 수 없습니다."));
                        userId = user.getId();
                }
                eventFacade.deleteEvent(id, userId);
                return ResponseEntity.noContent().build();
        }
