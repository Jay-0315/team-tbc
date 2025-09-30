package com.tbc.login.port.out;

import com.tbc.login.domain.User;
<<<<<<< HEAD
=======
import java.util.List;
>>>>>>> origin/dev
import java.util.Optional;

public interface UserRepositoryPort {
    User save(User user);
<<<<<<< HEAD
    Optional<User> findByEmail(String email);
    Optional<User> findByNickname(String nickname);
    Optional<User> findById(Long id);
=======
    Optional<User> findById(Long id);
    List<User> findByIdIn(List<Long> ids);
    Optional<User> findByEmail(String email);
    Optional<User> findByNickname(String nickname);
>>>>>>> origin/dev
    boolean existsByEmail(String email);
    boolean existsByNickname(String nickname);
}
