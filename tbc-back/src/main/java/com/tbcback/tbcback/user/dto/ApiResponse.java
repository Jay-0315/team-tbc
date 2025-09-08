package com.tbcback.tbcback.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApiResponse<T> {
    // API 통일 응답 래퍼
    private final boolean success;
    private final String message;
    private final T data;

    public static <T> ApiResponse<T> ok(T data) { return new ApiResponse<>(true, null, data); }
    public static <T> ApiResponse<T> message(String message) { return new ApiResponse<>(true, message, null); }
}
