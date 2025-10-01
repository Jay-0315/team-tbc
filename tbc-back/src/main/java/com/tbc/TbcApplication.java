package com.tbc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TbcApplication {

    public static void main(String[] args) {
        SpringApplication.run(TbcApplication.class, args);
    }

}
