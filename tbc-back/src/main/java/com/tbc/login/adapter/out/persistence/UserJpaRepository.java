package com.tbc.login.adapter.out.persistence;

import com.tbc.login.domain.User;
import com.tbc.login.port.out.UserRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UserJpaRepository implements UserRepositoryPort {

    private final SpringDataUserRepository repo;

    @Override
    public User save(User user) {
        return repo.save(user);
    }

    @Override
    public Optional<User> findById(Long id) {
        return repo.findById(id);
    }

    @Override
    public List<User> findByIdIn(List<Long> ids) {
        return repo.findAllById(ids);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return repo.findByEmail(email);
    }

    @Override
    public Optional<User> findByNickname(String nickname) {
        return repo.findByNickname(nickname);
    }

    @Override
    public Optional<User> findByGoogleId(String googleId) {
        return repo.findByGoogleId(googleId);
    }

    @Override
    public boolean existsByEmail(String email) {
        return repo.existsByEmail(email);
    }

    @Override
    public boolean existsByNickname(String nickname) {
        return repo.existsByNickname(nickname);
    }

    public List<User> findAllById(List<Long> ids) {
        return repo.findAllById(ids);
    }
}
