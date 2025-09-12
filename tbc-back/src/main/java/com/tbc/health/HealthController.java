package com.tbc.health;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class HealthController {
    @GetMapping("/api/helth/ready")
    public Map<String, String> ready() {
        return Map.of("status", "ok");
    }
 }