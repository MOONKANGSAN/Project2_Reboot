package com.example.Project2_Spring.controller;

import com.example.Project2_Spring.entity.RestaurantImg;
import com.example.Project2_Spring.service.RestaurantImgService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/backoffice/restaurant/img")
@RequiredArgsConstructor
public class RestaurantImgController {

    private final RestaurantImgService restaurantImgService;

    // POST /api/backoffice/restaurant/img/upload
    @PostMapping("/upload")
    public ResponseEntity<?> upload(
            @RequestParam("restaurantIdx") Integer restaurantIdx,
            @RequestParam("images") List<MultipartFile> images
    ) {
        try {
            List<RestaurantImg> saved = restaurantImgService.uploadImages(restaurantIdx, images);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("uploadedCount", saved.size());
            response.put("message", saved.size() + "개의 이미지가 업로드되었습니다.");

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "이미지 업로드 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }
}
