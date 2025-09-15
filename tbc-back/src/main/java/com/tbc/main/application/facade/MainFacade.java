package com.tbc.main.application.facade;

import com.tbc.main.application.service.MainService;
import com.tbc.main.domain.model.Main;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MainFacade {
    
    @Autowired
    private MainService mainService;
    
    /**
     * 메인 정보 조회 - 파사드 패턴으로 외부 인터페이스 제공
     */
    public Optional<Main> getMain(Long id) {
        return mainService.getMain(id);
    }
    
    /**
     * 모든 메인 정보 조회
     */
    public List<Main> getAllMains() {
        return mainService.getAllMains();
    }
    
    /**
     * 메인 정보 생성
     */
    public Main createMain(String title, String description) {
        return mainService.createMain(title, description);
    }
    
    /**
     * 메인 정보 업데이트
     */
    public Main updateMain(Long id, String title, String description) {
        return mainService.updateMain(id, title, description);
    }
    
    /**
     * 메인 정보 삭제
     */
    public void deleteMain(Long id) {
        mainService.deleteMain(id);
    }
}
