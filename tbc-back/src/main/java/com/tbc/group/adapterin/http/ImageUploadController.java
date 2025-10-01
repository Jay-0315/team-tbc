package com.tbc.group.adapterin.http;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/images")
@Tag(name = "Image Upload", description = "이미지 업로드 API")
public class ImageUploadController {

    // 운영체제 무관한 업로드 경로: 기본값은 프로젝트 작업 디렉토리 하위의 img 폴더
    @Value("${app.upload.dir:img}")
    private String uploadDir;
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif", "webp");

    @PostMapping("/upload")
    @Operation(summary = "이미지 업로드", description = "소셜링 이미지를 업로드하고 저장된 경로를 반환합니다.")
    public ResponseEntity<ImageUploadResponse> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            // 파일 유효성 검사
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(new ImageUploadResponse(null, "파일이 비어있습니다."));
            }

            // 파일 크기 검사
            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.badRequest().body(new ImageUploadResponse(null, "파일 크기는 5MB를 초과할 수 없습니다."));
            }

            // 파일 확장자 검사
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                return ResponseEntity.badRequest().body(new ImageUploadResponse(null, "파일명이 유효하지 않습니다."));
            }

            String extension = getFileExtension(originalFilename).toLowerCase();
            if (!ALLOWED_EXTENSIONS.contains(extension)) {
                return ResponseEntity.badRequest().body(new ImageUploadResponse(null, 
                    "허용되지 않는 파일 형식입니다. (jpg, jpeg, png, gif, webp만 가능)"));
            }

            // 업로드 디렉토리 생성
            File uploadDirFile = new File(uploadDir);
            if (!uploadDirFile.exists()) {
                uploadDirFile.mkdirs();
            }

            // UUID 파일명 생성
            String uuid = UUID.randomUUID().toString();
            String newFilename = uuid + "." + extension;
            Path filePath = Paths.get(uploadDir, newFilename);

            // 파일 저장
            Files.write(filePath, file.getBytes());

            // 저장된 파일 경로 반환 (웹에서 접근 가능한 경로)
            String imagePath = "/uploads/" + newFilename;

            System.out.println("Image uploaded successfully: " + imagePath);

            return ResponseEntity.ok(new ImageUploadResponse(imagePath, "이미지 업로드 성공"));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(new ImageUploadResponse(null, "이미지 업로드 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }

    public record ImageUploadResponse(String imagePath, String message) {}
}
