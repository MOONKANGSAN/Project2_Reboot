package com.example.Project2_Spring.controller;

import com.example.Project2_Spring.dto.PublicRestaurantDetailDto;
import com.example.Project2_Spring.dto.PublicRestaurantDto;
import com.example.Project2_Spring.dto.PublicReviewDto;
import com.example.Project2_Spring.dto.RestaurantDto;
import com.example.Project2_Spring.dto.RestaurantSearchItemDto;
import com.example.Project2_Spring.entity.restaurant;
import com.example.Project2_Spring.service.RestaurantHashtagService;
import com.example.Project2_Spring.service.RestaurantService;
import com.example.Project2_Spring.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

// 고객 서비스 공개 API — 인증 불필요
@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class PublicRestaurantController {

    private final RestaurantService      restaurantService;
    private final ReviewService          reviewService;
    private final RestaurantHashtagService restaurantHashtagService;

    // POST /api/restaurants/request — 고객 점포 등록 신청 (state=0 검토대기)
    @PostMapping("/request")
    public ResponseEntity<?> request(@RequestBody RestaurantDto dto) {
        try {
            restaurant r = new restaurant();
            r.setName(dto.getName());
            r.setCategory(dto.getCategory());
            r.setAddress(dto.getAddress());
            r.setLocation(dto.getLocation());
            r.setPhone(dto.getPhone());
            r.setPriceRange(dto.getPriceRange());
            r.setDescription(dto.getDescription());
            r.setLatitude(dto.getLatitude());
            r.setLongitude(dto.getLongitude());

            restaurant saved = restaurantService.requestRegister(r);

            if (dto.getHashtags() != null && !dto.getHashtags().isEmpty()) {
                restaurantHashtagService.syncHashtags(saved.getIdx(), dto.getHashtags());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "점포 등록 신청이 접수되었습니다. 검토 후 등록됩니다.");
            response.put("idx", saved.getIdx());
            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "점포 신청 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

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

    // GET /api/restaurants/search?keyword=xxx — 점포 자동완성 검색 (최대 10건)
    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam(defaultValue = "") String keyword) {
        try {
            List<RestaurantSearchItemDto> data = restaurantService.search(keyword);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "점포 검색 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // GET /api/restaurants/{idx}/reviews?limit=3 — 점포 리뷰 조회 (좋아요 많은순)
    @GetMapping("/{idx}/reviews")
    public ResponseEntity<?> reviews(
            @PathVariable Integer idx,
            @RequestParam(defaultValue = "3") int limit
    ) {
        try {
            List<PublicReviewDto> data = reviewService.getTopReviewsByRestaurant(idx, limit);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "리뷰 조회 중 오류가 발생했습니다.");
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
