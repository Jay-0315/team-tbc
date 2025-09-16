package com.tbc.main.domain.service;

import com.tbc.main.domain.model.Main;
import org.springframework.stereotype.Service;

@Service
public class MainDomainService {
    
    /**
     * 순수 도메인 로직 - 비즈니스 규칙 검증
     */
    public boolean isValidMain(Main main) {
        if (main == null) {
            return false;
        }
        
        if (main.getTitle() == null || main.getTitle().trim().isEmpty()) {
            return false;
        }
        
        if (main.getDescription() == null || main.getDescription().trim().isEmpty()) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 도메인 로직 - 메인 정보 생성 규칙
     */
    public Main createMain(String title, String description) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Title cannot be null or empty");
        }
        
        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("Description cannot be null or empty");
        }
        
        return new Main(title.trim(), description.trim());
    }
}
