package com.example.Project2_Spring.controller;

import com.example.Project2_Spring.dto.RestaurantDto;
import com.example.Project2_Spring.dto.RestaurantListItemDto;
import com.example.Project2_Spring.entity.restaurant;
import com.example.Project2_Spring.service.RestaurantHashtagService;
import com.example.Project2_Spring.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/backoffice/restaurant")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;
    private final RestaurantHashtagService restaurantHashtagService;

    // POST /api/backoffice/restaurant/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RestaurantDto dto) {
        try {
            restaurant r = new restaurant();
            r.setName(dto.getName());
            r.setCategory(dto.getCategory());
            r.setAddress(dto.getAddress());
            r.setLocation(dto.getLocation());
            r.setPhone(dto.getPhone());
            r.setPriceRange(dto.getPriceRange());
            r.setDescription(dto.getDescription());
            r.setImageUrl(dto.getImageUrl());

            restaurant saved = restaurantService.register(r);

            // 해시태그 동기화 (신규 점포이므로 전부 추가)
            if (dto.getHashtags() != null && !dto.getHashtags().isEmpty()) {
                restaurantHashtagService.syncHashtags(saved.getIdx(), dto.getHashtags());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "점포 등록 완료");
            response.put("idx", saved.getIdx());
            response.put("name", saved.getName());

            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "점포 등록 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // GET /api/backoffice/restaurant/{idx} - 단일 점포 조회
    @GetMapping("/{idx}")
    public ResponseEntity<?> findById(@PathVariable Integer idx) {
        try {
            RestaurantListItemDto data = restaurantService.findById(idx);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "점포 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // PATCH /api/backoffice/restaurant/{idx} - 점포 정보 수정
    @PatchMapping("/{idx}")
    public ResponseEntity<?> update(@PathVariable Integer idx, @RequestBody RestaurantDto dto) {
        try {
            RestaurantListItemDto payload = new RestaurantListItemDto(
                    null, dto.getName(), dto.getCategory(), dto.getAddress(),
                    dto.getLocation(), dto.getPhone(), dto.getPriceRange(),
                    dto.getDescription(), dto.getImageUrl(), null, null, null
            );
            restaurant updated = restaurantService.update(idx, payload);

            // 해시태그 동기화 (새 목록 기준으로 추가/제거 처리)
            restaurantHashtagService.syncHashtags(updated.getIdx(), dto.getHashtags());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "점포 수정 완료");
            response.put("idx", updated.getIdx());
            response.put("name", updated.getName());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "점포 수정 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // PATCH /api/backoffice/restaurant/{idx}/state — 상태 직접 지정 (body: {"state": 0|1|2})
    @PatchMapping("/{idx}/state")
    public ResponseEntity<?> setState(
            @PathVariable Integer idx,
            @RequestBody Map<String, Integer> body
    ) {
        try {
            Integer newState = body.get("state");
            if (newState == null) throw new IllegalArgumentException("state 값이 필요합니다.");
            restaurant updated = restaurantService.setState(idx, newState);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("idx",   updated.getIdx());
            response.put("state", updated.getState());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "상태 변경 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // GET /api/backoffice/restaurant/list - 점포 목록 조회
    @GetMapping("/list")
    public ResponseEntity<?> list() {
        try {
            List<RestaurantListItemDto> items = restaurantService.getList();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", items);
            response.put("total", items.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "점포 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }
}
