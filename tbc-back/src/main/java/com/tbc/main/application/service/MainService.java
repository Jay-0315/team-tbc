package com.tbc.main.application.service;

import com.tbc.main.domain.model.Main;
import com.tbc.main.infrastructure.repository.MainRepositoryImpl;
import com.tbc.main.domain.service.MainDomainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MainService {
    
    @Autowired
    private MainRepositoryImpl mainRepository;
    
    @Autowired
    private MainDomainService mainDomainService;
    
    /**
     * 메인 정보 조회
     */
    @Transactional(readOnly = true)
    public Optional<Main> getMain(Long id) {
        return mainRepository.findById(id);
    }
    
    /**
     * 모든 메인 정보 조회
     */
    @Transactional(readOnly = true)
    public List<Main> getAllMains() {
        return mainRepository.findAll();
    }
    
    /**
     * 메인 정보 생성
     */
    public Main createMain(String title, String description) {
        Main main = mainDomainService.createMain(title, description);
        
        if (!mainDomainService.isValidMain(main)) {
            throw new IllegalArgumentException("Invalid main data");
        }
        
        return mainRepository.save(main);
    }
    
    /**
     * 메인 정보 업데이트
     */
    public Main updateMain(Long id, String title, String description) {
        Main main = mainRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Main not found with id: " + id));
        
        main.setTitle(title);
        main.setDescription(description);
        
        if (!mainDomainService.isValidMain(main)) {
            throw new IllegalArgumentException("Invalid main data");
        }
        
        return mainRepository.save(main);
    }
    
    /**
     * 메인 정보 삭제
     */
    public void deleteMain(Long id) {
        if (!mainRepository.existsById(id)) {
            throw new IllegalArgumentException("Main not found with id: " + id);
        }
        
        mainRepository.deleteById(id);
    }
}
