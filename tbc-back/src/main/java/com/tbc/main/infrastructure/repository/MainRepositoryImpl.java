package com.tbc.main.infrastructure.repository;

import com.tbc.main.domain.model.Main;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Infrastructure layer implementation of MainRepository
 * This extends JpaRepository for Spring Data JPA functionality
 */
@Repository
public interface MainRepositoryImpl extends JpaRepository<Main, Long> {
    // Spring Data JPA implementation
    // Additional custom queries can be added here
}
