package com.example.Project2_Spring.controller;

import com.example.Project2_Spring.dto.RestaurantDto;
import com.example.Project2_Spring.entity.restaurant;
import com.example.Project2_Spring.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/backoffice/restaurant")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

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
}
