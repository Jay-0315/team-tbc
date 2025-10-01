package com.tbc.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.File;

@Component
public class UploadDirectoryInitializer implements CommandLineRunner {

    @Value("${app.upload.dir:./img}")
    private String uploadDir;

    @Override
    public void run(String... args) throws Exception {
        File uploadDirFile = new File(uploadDir).getAbsoluteFile();
        
        if (!uploadDirFile.exists()) {
            boolean created = uploadDirFile.mkdirs();
            if (!created) {
                System.err.println("❌ Failed to create upload directory: " + uploadDirFile.getAbsolutePath());
            }
        }
    }
}
