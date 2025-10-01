package com.tbc.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

/**
 * 정적 리소스(이미지 등) 핸들러 설정
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:./img}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 업로드 디렉토리의 절대 경로 구하기
        File uploadDirFile = new File(uploadDir).getAbsoluteFile();
        String uploadDirPath = "file:" + uploadDirFile.getAbsolutePath() + "/";
        
        System.out.println("📁 Static resource mapping:");
        System.out.println("   /img/** → " + uploadDirPath);
        System.out.println("   /uploads/** → " + uploadDirPath);
        
        // /img/** 경로를 실제 업로드 디렉토리로 매핑
        registry.addResourceHandler("/img/**")
                .addResourceLocations(uploadDirPath)
                .setCachePeriod(3600); // 1시간 캐시
        
        // /uploads/** 경로도 동일하게 매핑 (API 응답과 일치)
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadDirPath)
                .setCachePeriod(3600);
    }
}

