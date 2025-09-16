package com.tbc.main.domain.repository;

import com.tbc.main.domain.model.Main;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface MainRepository extends org.springframework.data.jpa.repository.JpaRepository<Main, Long> {
    // Domain repository interface
    // Additional query methods can be added here
}
