package com.example.Project2_Spring.controller;

import com.example.Project2_Spring.dto.InquiryListItemDto;
import com.example.Project2_Spring.dto.InquiryWriteDto;
import com.example.Project2_Spring.entity.Inquiry;
import com.example.Project2_Spring.service.InquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inquiry")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryService inquiryService;

    // POST /api/inquiry — 문의 작성
    @PostMapping
    public ResponseEntity<?> write(@RequestBody InquiryWriteDto dto) {
        try {
            Inquiry saved = inquiryService.write(dto);
            Map<String, Object> response = new HashMap<>();
            response.put("success",    true);
            response.put("message",    "문의가 접수되었습니다.");
            response.put("inquiryIdx", saved.getIdx());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "문의 접수 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // GET /api/inquiry/my?userId=xxx — 내 문의 목록
    @GetMapping("/my")
    public ResponseEntity<?> myList(@RequestParam String userId) {
        try {
            List<InquiryListItemDto> data = inquiryService.getMyList(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data",    data);
            response.put("total",   data.size());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "문의 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // GET /api/inquiry/public — 공개 문의 목록
    @GetMapping("/public")
    public ResponseEntity<?> publicList() {
        try {
            List<InquiryListItemDto> data = inquiryService.getPublicList();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data",    data);
            response.put("total",   data.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "공개 문의 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }
}
