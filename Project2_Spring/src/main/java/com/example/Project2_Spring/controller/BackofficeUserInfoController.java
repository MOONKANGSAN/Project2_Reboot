package com.example.Project2_Spring.controller;

import com.example.Project2_Spring.entity.BackofficeUserInfo;
import com.example.Project2_Spring.service.BackofficeUserInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

// ─────────────────────────────────────────────────────────────────
// 백오피스 관리자 API 컨트롤러
// 공통 경로: /api/backoffice
// ─────────────────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/backoffice")
@RequiredArgsConstructor
public class BackofficeUserInfoController {

    private final BackofficeUserInfoService backofficeUserInfoService;

    // ─────────────────────────────────────────────────────────────
    // 1. 관리자 로그인
    // POST /api/backoffice/login
    // Body: { "id": "admin01", "password": "평문비밀번호" }
    // ─────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            // 요청 바디에서 id, password 추출
            String id = body.get("id");
            String password = body.get("password");

            // 서비스 레이어에서 인증 처리
            BackofficeUserInfo admin = backofficeUserInfoService.login(id, password);

            // 로그인 성공 응답 구성 (비밀번호는 응답에 포함하지 않음)
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "로그인 성공");
            response.put("id", admin.getId());
            response.put("level", admin.getLevel());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            // 인증 실패 (아이디 없음, 비밀번호 불일치, 비활성 계정)
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(401).body(errorResponse);

        } catch (Exception e) {
            // 기타 서버 오류
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "서버 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. 비밀번호 해싱 유틸 엔드포인트
    // GET /api/backoffice/hash-password?raw=평문비밀번호
    // MySQL에 직접 INSERT할 해시값을 생성할 때만 사용
    // 실서비스 배포 전 반드시 이 엔드포인트는 제거하거나 접근 제한할 것
    // ─────────────────────────────────────────────────────────────
}