package com.tbc_back.tbc_back;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.tbc_back.tbc_back")
@EntityScan(basePackages = "com.tbc_back.tbc_back")
public class TbcApplication {
    public static void main(String[] args) {
        SpringApplication.run(TbcApplication.class, args);
    }
}
