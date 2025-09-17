package com.tbc.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "chat")
public class ChatProperties {

    /**
     * 최대 메시지 길이
     */
    private int maxContentLength = 1000;

    /**
     * 세션당 초당 허용 QPS
     */
    private int maxQpsPerSession = 10;
}
