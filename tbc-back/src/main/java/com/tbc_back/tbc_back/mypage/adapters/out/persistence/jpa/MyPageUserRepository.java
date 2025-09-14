// User Repository
package com.tbc_back.tbc_back.mypage.adapters.out.persistence.jpa;

import com.tbc_back.tbc_back.point.adapters.out.persistence.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MyPageUserRepository extends JpaRepository<UserEntity, Long> { }
