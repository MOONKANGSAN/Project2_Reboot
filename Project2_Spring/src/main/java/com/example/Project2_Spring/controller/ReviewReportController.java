package com.example.Project2_Spring.controller;

import com.example.Project2_Spring.dto.BackofficeReviewReportItemDto;
import com.example.Project2_Spring.entity.ReviewReport;
import com.example.Project2_Spring.service.ReviewReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ReviewReportController {

    private final ReviewReportService reviewReportService;

    // POST /api/reviews/{reviewIdx}/report — 신고 접수
    @PostMapping("/api/reviews/{reviewIdx}/report")
    public ResponseEntity<?> report(
            @PathVariable Integer reviewIdx,
            @RequestBody  Map<String, String> body
    ) {
        try {
            String userId       = body.get("userId");
            String reportType   = body.get("reportType");
            String customContent = body.get("customContent");

            reviewReportService.report(reviewIdx, userId, reportType, customContent);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "신고가 접수되었습니다.");
            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);

        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "신고 처리 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // GET /api/backoffice/review-reports — 신고 목록 조회 (백오피스)
    @GetMapping("/api/backoffice/review-reports")
    public ResponseEntity<?> adminList() {
        try {
            List<BackofficeReviewReportItemDto> data = reviewReportService.getAdminList();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            response.put("total", data.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "신고 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // PATCH /api/backoffice/review-reports/{idx}/state — 처리 상태 변경
    @PatchMapping("/api/backoffice/review-reports/{idx}/state")
    public ResponseEntity<?> updateState(
            @PathVariable Integer idx,
            @RequestBody  Map<String, Integer> body
    ) {
        try {
            Integer newState = body.get("state");
            ReviewReport updated = reviewReportService.updateState(idx, newState);

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
}
