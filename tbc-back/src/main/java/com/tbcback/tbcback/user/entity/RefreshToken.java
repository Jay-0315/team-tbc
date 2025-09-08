package com.tbcback.tbcback.user.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "refresh_tokens",
        indexes = {
                @Index(name = "idx_rt_user", columnList = "userId"),
                @Index(name = "idx_rt_username", columnList = "username")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {
    // jti를 기본키로 사용
    @Id
    @Column(length = 64)
    private String jti;

    // 사용자 ID
    private Long userId;

    // 사용자명(소문자 정규화 권장)
    private String username;

    // 만료 시각
    private Instant expiresAt;

    // 폐기 여부
    private boolean revoked;

    // 생성/수정 시각
    private Instant createdAt;
    private Instant updatedAt;
}
