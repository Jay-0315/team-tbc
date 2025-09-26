// adapterout/persistence/jpa/entity/GroupMemberEntity.java
package com.tbc.group.adapterout.persistence.jpa.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;


@Table(name="group_members",
        uniqueConstraints = @UniqueConstraint(name="uk_group_user", columnNames={"group_id","user_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class GroupMemberEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;
    @Column(name="group_id", nullable=false) Long groupId;
    @Column(name="user_id",  nullable=false) Long userId;
    @Column(nullable=false, length=16) String role;   // HOST/MEMBER
    @Column(nullable=false, length=16) String status; // ACTIVE...
    @CreationTimestamp @Column(nullable=false, updatable=false) LocalDateTime joinedAt;
}
