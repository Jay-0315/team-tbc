package com.tbc.infrastructure.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    public static final String API_KEY_NAME = "X-User-Id";

    @Bean
    public OpenAPI teamTbcOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("TEAM-TBC Events API")
                        .version("v1")
                        .description("TEAM-TBC 이벤트 도메인 OpenAPI 문서"))
                .components(new Components()
                        .addSecuritySchemes(API_KEY_NAME,
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.HEADER)
                                        .name(API_KEY_NAME)
                        )
                )
                // 선택적 요구사항으로 선언 (실제 엔드포인트는 인증 없이도 접근 가능)
                .addSecurityItem(new SecurityRequirement().addList(API_KEY_NAME));
    }

    @Bean
    public GroupedOpenApi eventsGroup() {
        return GroupedOpenApi.builder()
                .group("events")
                .pathsToMatch("/api/events/**")
                .build();
    }

    @Bean
    public GroupedOpenApi reviewsGroup() {
        // TODO: 리뷰 도메인 구현 시 컨트롤러 추가 예정
        return GroupedOpenApi.builder()
                .group("reviews")
                .pathsToMatch("/api/events/*/reviews/**")
                .build();
    }
}


