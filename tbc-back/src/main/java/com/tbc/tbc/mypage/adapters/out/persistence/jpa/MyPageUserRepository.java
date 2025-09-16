// User Repository
package com.tbc.tbc.mypage.adapters.out.persistence.jpa;

import com.tbc.tbc.mypage.adapters.out.persistence.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MyPageUserRepository extends JpaRepository<UserEntity, Long> { }
