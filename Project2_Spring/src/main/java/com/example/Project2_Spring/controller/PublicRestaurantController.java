package com.example.Project2_Spring.controller;

import com.example.Project2_Spring.dto.PublicRestaurantDetailDto;
import com.example.Project2_Spring.dto.PublicRestaurantDto;
import com.example.Project2_Spring.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

// 고객 서비스 공개 API — 인증 불필요
@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class PublicRestaurantController {

    private final RestaurantService restaurantService;

    // GET /api/restaurants — 활성 점포 목록 (최신 등록순, 해시태그 포함)
    @GetMapping
    public ResponseEntity<?> list() {
        try {
            List<PublicRestaurantDto> data = restaurantService.getPublicList();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            response.put("total", data.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "맛집 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // GET /api/restaurants/{idx} — 점포 상세 조회
    @GetMapping("/{idx}")
    public ResponseEntity<?> detail(@PathVariable Integer idx) {
        try {
            PublicRestaurantDetailDto data = restaurantService.getPublicDetail(idx);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "점포 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }
}
