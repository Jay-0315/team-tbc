package com.tbc.events.web.controller;

import com.tbc.events.application.service.LocationService;
import com.tbc.events.web.dto.LocationSearchResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/location")
@RequiredArgsConstructor
@Tag(name = "Location", description = "장소 검색 API")
public class LocationController {

    private final LocationService locationService;

    @GetMapping("/search")
    @Operation(summary = "장소 검색", description = "Nominatim API를 통해 장소를 검색합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "검색 성공"),
        @ApiResponse(responseCode = "400", description = "요청 오류"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    public ResponseEntity<List<LocationSearchResponse>> searchLocation(
            @Parameter(description = "검색 키워드", required = true)
            @RequestParam String q,
            @Parameter(description = "결과 개수 제한", required = false)
            @RequestParam(defaultValue = "5") int limit) {
        
        try {
            List<LocationSearchResponse> results = locationService.searchLocation(q, limit);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
