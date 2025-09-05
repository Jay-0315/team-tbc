package com.tbc.tbc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication(scanBasePackages = "com.tbc.tbc")
public class TbcApplication {

    public static void main(String[] args) {
        SpringApplication.run(TbcApplication.class, args);
    }

}
