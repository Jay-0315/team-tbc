package com.tbc.main.web.mapper;

import com.tbc.main.domain.model.Main;
import com.tbc.main.web.dto.MainDTO;
import org.springframework.stereotype.Component;

@Component
public class MainMapper {
    
    /**
     * Domain Entity to DTO 변환
     */
    public MainDTO toDTO(Main main) {
        if (main == null) {
            return null;
        }
        
        return new MainDTO(
            main.getId(),
            main.getTitle(),
            main.getDescription(),
            main.getCreatedAt(),
            main.getUpdatedAt()
        );
    }
    
    /**
     * DTO to Domain Entity 변환
     */
    public Main toEntity(MainDTO mainDTO) {
        if (mainDTO == null) {
            return null;
        }
        
        Main main = new Main();
        main.setId(mainDTO.getId());
        main.setTitle(mainDTO.getTitle());
        main.setDescription(mainDTO.getDescription());
        main.setCreatedAt(mainDTO.getCreatedAt());
        main.setUpdatedAt(mainDTO.getUpdatedAt());
        
        return main;
    }
}
