package com.tbc.events.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public class FavoriteResponse {
    @Schema(description = "즐겨찾기 상태", example = "true")
    public boolean favorited;

    public FavoriteResponse(boolean favorited) {
        this.favorited = favorited;
    }
}



