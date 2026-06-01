package com.example.Project2_Spring.controller;

import com.example.Project2_Spring.dto.BackofficeUserDto;
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
    // 1. 관리자 계정 가입
    // POST /api/backoffice/signup
    // Body: { "id": "admin01", "password": "Admin1234!", "level": 2 }
    // ─────────────────────────────────────────────────────────────
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody BackofficeUserDto dto) {
        try {
            // DTO → Entity 변환
            BackofficeUserInfo adminInfo = new BackofficeUserInfo();
            adminInfo.setId(dto.getId());
            adminInfo.setPassword(dto.getPassword()); // Service에서 해싱됨
            adminInfo.setLevel(dto.getLevel());        // null이면 @PrePersist에서 기본값 1 적용

            // Service에서 중복 체크 + 비밀번호 해싱 + DB 저장 처리
            BackofficeUserInfo saved = backofficeUserInfoService.signup(adminInfo);

            // 성공 응답 구성 (비밀번호 해시는 응답에 포함하지 않음)
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "관리자 계정 생성 완료");
            response.put("id", saved.getId());
            response.put("level", saved.getLevel());
            response.put("regDate", saved.getRegDate());

            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            // 아이디 중복 시
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);

        } catch (Exception e) {
            // 기타 서버 오류
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "계정 생성 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

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