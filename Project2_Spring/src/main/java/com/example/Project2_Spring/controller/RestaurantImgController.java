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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/backoffice/restaurant/img")
@RequiredArgsConstructor
public class RestaurantImgController {

    private final RestaurantImgService restaurantImgService;

    // GET /api/backoffice/restaurant/img/list?restaurantIdx={idx} — 점포 이미지 목록
    @GetMapping("/list")
    public ResponseEntity<?> list(@RequestParam Integer restaurantIdx) {
        try {
            List<RestaurantImg> images = restaurantImgService.getImages(restaurantIdx);
            List<Map<String, Object>> data = images.stream().map(img -> {
                Map<String, Object> m = new HashMap<>();
                m.put("idx",      img.getIdx());
                m.put("imgUrl",   img.getImgUrl());
                m.put("imgOrder", img.getImgOrder());
                m.put("state",    img.getState());
                return m;
            }).collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data",    data);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "이미지 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // DELETE /api/backoffice/restaurant/img/{imgIdx} — 이미지 삭제 (파일+DB)
    @DeleteMapping("/{imgIdx}")
    public ResponseEntity<?> delete(@PathVariable Integer imgIdx) {
        try {
            restaurantImgService.deleteImage(imgIdx);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "이미지가 삭제되었습니다.");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "이미지 삭제 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

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
