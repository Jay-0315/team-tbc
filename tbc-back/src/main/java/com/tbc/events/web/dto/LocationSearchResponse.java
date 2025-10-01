package com.tbc.events.web.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationSearchResponse {
    private double lat;
    private double lng;
    private String displayName;
}
