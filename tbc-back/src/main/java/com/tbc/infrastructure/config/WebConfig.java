package com.tbc.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 이미지 정적 리소스 매핑
        // /uploads/** 경로로 접근하면 D:/team-tbc/tbc-back/img/ 폴더의 파일 제공
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:D:/team-tbc/tbc-back/img/");
    }
}
