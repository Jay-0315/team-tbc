package com.tbc.main.web.controller;

import com.tbc.main.application.facade.MainFacade;
import com.tbc.main.domain.model.Main;
import com.tbc.main.web.dto.MainDTO;
import com.tbc.main.web.mapper.MainMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/main")
@Tag(name = "Main", description = "메인 페이지 관리 API")
public class MainController {
    
    @Autowired
    private MainFacade mainFacade;
    
    @Autowired
    private MainMapper mainMapper;
    
    @GetMapping
    @Operation(summary = "메인 정보 조회", description = "모든 메인 정보를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    public ResponseEntity<List<MainDTO>> getAllMains() {
        List<Main> mains = mainFacade.getAllMains();
        List<MainDTO> mainDTOs = mains.stream()
                .map(mainMapper::toDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(mainDTOs);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "메인 정보 상세 조회", description = "특정 ID의 메인 정보를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "메인 정보를 찾을 수 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    public ResponseEntity<MainDTO> getMain(
            @Parameter(description = "메인 정보 ID", required = true)
            @PathVariable Long id) {
        
        Optional<Main> main = mainFacade.getMain(id);
        if (main.isPresent()) {
            MainDTO mainDTO = mainMapper.toDTO(main.get());
            return ResponseEntity.ok(mainDTO);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    @Operation(summary = "메인 정보 생성", description = "새로운 메인 정보를 생성합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "생성 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    public ResponseEntity<MainDTO> createMain(@RequestBody MainDTO mainDTO) {
        Main createdMain = mainFacade.createMain(mainDTO.getTitle(), mainDTO.getDescription());
        MainDTO createdMainDTO = mainMapper.toDTO(createdMain);
        
        return ResponseEntity.ok(createdMainDTO);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "메인 정보 수정", description = "기존 메인 정보를 수정합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "수정 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "404", description = "메인 정보를 찾을 수 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    public ResponseEntity<MainDTO> updateMain(
            @Parameter(description = "메인 정보 ID", required = true)
            @PathVariable Long id,
            @RequestBody MainDTO mainDTO) {
        
        Main updatedMain = mainFacade.updateMain(id, mainDTO.getTitle(), mainDTO.getDescription());
        MainDTO updatedMainDTO = mainMapper.toDTO(updatedMain);
        
        return ResponseEntity.ok(updatedMainDTO);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "메인 정보 삭제", description = "특정 ID의 메인 정보를 삭제합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "삭제 성공"),
        @ApiResponse(responseCode = "404", description = "메인 정보를 찾을 수 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    public ResponseEntity<Void> deleteMain(
            @Parameter(description = "메인 정보 ID", required = true)
            @PathVariable Long id) {
        
        mainFacade.deleteMain(id);
        return ResponseEntity.noContent().build();
    }
}
