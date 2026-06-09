package com.example.Project2_Spring.controller;

import com.example.Project2_Spring.dto.BackofficeReviewListItemDto;
import com.example.Project2_Spring.dto.PublicReviewDto;
import com.example.Project2_Spring.entity.Review;
import com.example.Project2_Spring.service.ReviewLikeService;
import com.example.Project2_Spring.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService     reviewService;
    private final ReviewLikeService reviewLikeService;

    // GET /api/reviews — 공개 리뷰 목록 조회 (최신순)
    @GetMapping
    public ResponseEntity<?> list() {
        try {
            List<PublicReviewDto> data = reviewService.getPublicList();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            response.put("total", data.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "리뷰 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // ── 백오피스 전용 ──────────────────────────────────────────────

    // GET /api/reviews/admin — 전체 리뷰 목록 (활성+비활성)
    @GetMapping("/admin")
    public ResponseEntity<?> adminList() {
        try {
            List<BackofficeReviewListItemDto> data = reviewService.getAdminList();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            response.put("total", data.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "리뷰 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // PATCH /api/reviews/{reviewIdx}/state — 상태 토글 (1↔0)
    @PatchMapping("/{reviewIdx}/state")
    public ResponseEntity<?> toggleState(@PathVariable Integer reviewIdx) {
        try {
            Review updated = reviewService.toggleState(reviewIdx);
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

    // GET /api/reviews/my-likes?userId=xxx — 내가 좋아요한 리뷰 idx 목록
    @GetMapping("/my-likes")
    public ResponseEntity<?> myLikes(@RequestParam String userId) {
        try {
            List<Integer> idxList = reviewLikeService.getMyLikedReviewIdxList(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("likedIdxList", idxList);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "좋아요 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // POST /api/reviews/{reviewIdx}/like — 좋아요 토글
    @PostMapping("/{reviewIdx}/like")
    public ResponseEntity<?> toggleLike(
            @PathVariable Integer reviewIdx,
            @RequestBody  Map<String, String> body
    ) {
        try {
            String userId = body.get("userId");
            int[] result  = reviewLikeService.toggle(reviewIdx, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success",   true);
            response.put("state",     result[0]);   // 0 or 1
            response.put("likeCount", result[1]);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "좋아요 처리 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // POST /api/reviews — 리뷰 작성 (multipart/form-data)
    @PostMapping
    public ResponseEntity<?> write(
            @RequestParam("restaurantIdx") Integer restaurantIdx,
            @RequestParam("userId")        String userId,
            @RequestParam("rating")        Integer rating,
            @RequestParam("content")       String content,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        try {
            Review saved = reviewService.write(restaurantIdx, userId, rating, content, image);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "리뷰가 등록되었습니다.");
            response.put("reviewIdx", saved.getIdx());
            response.put("regDate", saved.getRegDate());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "리뷰 등록 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }
}
