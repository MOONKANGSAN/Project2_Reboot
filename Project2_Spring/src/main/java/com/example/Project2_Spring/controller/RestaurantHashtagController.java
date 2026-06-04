package com.example.Project2_Spring.controller;

import com.example.Project2_Spring.dto.HashtagMasterDto;
import com.example.Project2_Spring.dto.HashtagResponseDto;
import com.example.Project2_Spring.service.RestaurantHashtagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class RestaurantHashtagController {

    private final RestaurantHashtagService restaurantHashtagService;

    // GET /api/backoffice/hashtag/list - 해시태그 마스터 전체 목록
    @GetMapping("/api/backoffice/hashtag/list")
    public ResponseEntity<?> getMasterList() {
        try {
            List<HashtagMasterDto> data = restaurantHashtagService.getMasterList();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            response.put("total", data.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return error500("해시태그 목록 조회 중 오류가 발생했습니다.");
        }
    }

    // GET /api/backoffice/restaurant/{restaurantIdx}/hashtag - 점포 해시태그 목록
    @GetMapping("/api/backoffice/restaurant/{restaurantIdx}/hashtag")
    public ResponseEntity<?> getHashtags(@PathVariable Integer restaurantIdx) {
        try {
            List<HashtagResponseDto> data = restaurantHashtagService.getHashtags(restaurantIdx);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return error500("해시태그 목록 조회 중 오류가 발생했습니다.");
        }
    }

    // POST /api/backoffice/restaurant/{restaurantIdx}/hashtag - 해시태그 등록
    @PostMapping("/api/backoffice/restaurant/{restaurantIdx}/hashtag")
    public ResponseEntity<?> addHashtag(
            @PathVariable Integer restaurantIdx,
            @RequestBody Map<String, String> body
    ) {
        try {
            String tagName = body.getOrDefault("name", "").trim();
            HashtagResponseDto saved = restaurantHashtagService.addHashtag(restaurantIdx, tagName);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", saved);
            response.put("message", "해시태그가 등록되었습니다.");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return error400(e.getMessage());
        } catch (Exception e) {
            return error500("해시태그 등록 중 오류가 발생했습니다.");
        }
    }

    // PATCH /api/backoffice/hashtag/{hashtagIdx} - 해시태그 이름 수정
    @PatchMapping("/api/backoffice/hashtag/{hashtagIdx}")
    public ResponseEntity<?> updateHashtag(
            @PathVariable Integer hashtagIdx,
            @RequestBody Map<String, String> body
    ) {
        try {
            String newName = body.getOrDefault("name", "").trim();
            HashtagResponseDto updated = restaurantHashtagService.updateHashtag(hashtagIdx, newName);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", updated);
            response.put("message", "해시태그가 수정되었습니다.");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return error400(e.getMessage());
        } catch (Exception e) {
            return error500("해시태그 수정 중 오류가 발생했습니다.");
        }
    }

    // DELETE /api/backoffice/restaurant/hashtag/{restaurantHashtagIdx} - 점포에서 해시태그 삭제
    @DeleteMapping("/api/backoffice/restaurant/hashtag/{restaurantHashtagIdx}")
    public ResponseEntity<?> removeHashtag(@PathVariable Integer restaurantHashtagIdx) {
        try {
            restaurantHashtagService.removeHashtag(restaurantHashtagIdx);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "해시태그가 삭제되었습니다.");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return error400(e.getMessage());
        } catch (Exception e) {
            return error500("해시태그 삭제 중 오류가 발생했습니다.");
        }
    }

    private ResponseEntity<?> error400(String message) {
        Map<String, Object> err = new HashMap<>();
        err.put("success", false);
        err.put("message", message);
        return ResponseEntity.badRequest().body(err);
    }

    private ResponseEntity<?> error500(String message) {
        Map<String, Object> err = new HashMap<>();
        err.put("success", false);
        err.put("message", message);
        return ResponseEntity.status(500).body(err);
    }
}
