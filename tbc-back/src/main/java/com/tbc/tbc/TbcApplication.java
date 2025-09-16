package com.tbc.tbc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@EnableJpaAuditing
@SpringBootApplication(scanBasePackages = {"com.tbc", "tbc"})
@EntityScan(basePackages = {"com.tbc", "tbc"})
@EnableJpaRepositories(basePackages = {"com.tbc", "tbc"})
public class TbcApplication {

    public static void main(String[] args) {
        SpringApplication.run(TbcApplication.class, args);
    }

}