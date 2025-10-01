package com.tbc.events.application.service;

import com.tbc.events.web.dto.LocationSearchResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

@Service
@Slf4j
public class LocationService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

    public List<LocationSearchResponse> searchLocation(String query, int limit) {
        try {
            log.info("🔍 장소 검색 시작: {}", query);
            
            // URL 구성
            String url = String.format("%s?format=json&q=%s&limit=%d", 
                NOMINATIM_URL, 
                URLEncoder.encode(query, StandardCharsets.UTF_8), 
                limit);
            
            log.info("🔍 요청 URL: {}", url);
            
            // HTTP 연결 설정
            URL urlObj = new URL(url);
            HttpURLConnection connection = (HttpURLConnection) urlObj.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("User-Agent", "TBC-Holapop/1.0 (https://github.com/team-tbc; contact@tbc.com)");
            connection.setRequestProperty("Accept-Language", "ko,en");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);
            
            log.info("🔍 응답 상태: {}", connection.getResponseCode());
            
            if (connection.getResponseCode() != 200) {
                log.error("🔍 API 호출 실패: {}", connection.getResponseCode());
                return new ArrayList<>();
            }
            
            // 응답 읽기
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8)
            );
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
            reader.close();
            
            // JSON 파싱
            JsonNode jsonArray = objectMapper.readTree(response.toString());
            List<LocationSearchResponse> results = new ArrayList<>();
            
            if (jsonArray.isArray()) {
                for (JsonNode item : jsonArray) {
                    LocationSearchResponse location = new LocationSearchResponse();
                    location.setLat(item.get("lat").asDouble());
                    location.setLng(item.get("lon").asDouble());
                    location.setDisplayName(item.get("display_name").asText());
                    results.add(location);
                }
            }
            
            log.info("🔍 검색 결과 개수: {}", results.size());
            return results;
            
        } catch (Exception e) {
            log.error("🔍 장소 검색 오류: {}", e.getMessage(), e);
            // 빈 결과 반환으로 에러 방지
            return new ArrayList<>();
        }
    }
}
