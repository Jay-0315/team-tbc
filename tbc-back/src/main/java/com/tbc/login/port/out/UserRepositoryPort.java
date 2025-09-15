package com.tbcback.tbcback.login.port.out;

import com.tbcback.tbcback.login.domain.User;
import java.util.Optional;

public interface UserRepositoryPort {
    User save(User user);
    Optional<User> findByEmail(String email);
    Optional<User> findByNickname(String nickname);
    boolean existsByEmail(String email);
    boolean existsByNickname(String nickname);
}
