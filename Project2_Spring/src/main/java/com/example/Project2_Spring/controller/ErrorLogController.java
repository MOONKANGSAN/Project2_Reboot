package com.example.Project2_Spring.controller;

import com.example.Project2_Spring.dto.ErrorLogDto;
import com.example.Project2_Spring.entity.ErrorLog;
import com.example.Project2_Spring.service.ErrorLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 에러 로그 컨트롤러
 * React 프론트엔드에서 에러 발생 시 전송받아 DB에 저장하는 API 제공
 */
@Slf4j
@RestController
@RequestMapping("/api/error-log")
@RequiredArgsConstructor
public class ErrorLogController {

    private final ErrorLogService errorLogService;

    /**
     * 에러 로그 저장 API
     * POST http://localhost:8080/api/error-log
     *
     * React에서 에러 발생 시 호출하여 에러 정보를 DB에 저장
     */
    @PostMapping
    public ResponseEntity<?> logError(
            @RequestBody ErrorLogDto errorLogDto,
            HttpServletRequest request) {

        try {
            // 클라이언트 IP 주소 추출
            String ipAddress = getClientIpAddress(request);

            // User-Agent가 DTO에 없으면 헤더에서 추출
            if (errorLogDto.getUserAgent() == null || errorLogDto.getUserAgent().isEmpty()) {
                errorLogDto.setUserAgent(request.getHeader("User-Agent"));
            }

            // 에러 로그 저장
            ErrorLog savedLog = errorLogService.saveErrorLog(errorLogDto, ipAddress);

            // 성공 응답
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "에러 로그가 저장되었습니다.");
            response.put("errorLogId", savedLog.getId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // 에러 로깅 실패 시에도 클라이언트에 200 응답
            // (에러 로깅 실패가 사용자 경험에 영향을 주지 않도록)
            log.error("Error logging failed: {}", e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "에러 로그 저장 실패: " + e.getMessage());

            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * 사용자별 에러 로그 조회 API (관리자용)
     * GET http://localhost:8080/api/error-log/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserErrorLogs(@PathVariable String userId) {
        try {
            List<ErrorLog> logs = errorLogService.getUserErrorLogs(userId);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("에러 로그 조회 실패: " + e.getMessage());
        }
    }

    /**
     * 미해결 에러 목록 조회 API (관리자용)
     * GET http://localhost:8080/api/error-log/unresolved
     */
    @GetMapping("/unresolved")
    public ResponseEntity<?> getUnresolvedErrors() {
        try {
            List<ErrorLog> logs = errorLogService.getUnresolvedErrors();
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("미해결 에러 조회 실패: " + e.getMessage());
        }
    }

    /**
     * 프론트엔드 에러 목록 조회 API (관리자용)
     * GET http://localhost:8080/api/error-log/frontend
     */
    @GetMapping("/frontend")
    public ResponseEntity<?> getFrontendErrors() {
        try {
            List<ErrorLog> logs = errorLogService.getFrontendErrors();
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("프론트엔드 에러 조회 실패: " + e.getMessage());
        }
    }

    /**
     * 백엔드 에러 목록 조회 API (관리자용)
     * GET http://localhost:8080/api/error-log/backend
     */
    @GetMapping("/backend")
    public ResponseEntity<?> getBackendErrors() {
        try {
            List<ErrorLog> logs = errorLogService.getBackendErrors();
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("백엔드 에러 조회 실패: " + e.getMessage());
        }
    }

    /**
     * 에러 해결 처리 API (관리자용)
     * PUT http://localhost:8080/api/error-log/{id}/resolve
     */
    @PutMapping("/{id}/resolve")
    public ResponseEntity<?> resolveError(@PathVariable Long id) {
        try {
            errorLogService.markAsResolved(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "에러가 해결 처리되었습니다.");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("에러 해결 처리 실패: " + e.getMessage());
        }
    }

    /**
     * 클라이언트 IP 주소 추출 헬퍼 메소드
     * 프록시 환경에서도 실제 클라이언트 IP를 정확히 가져오기 위한 처리
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");

        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_CLUSTER_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_FORWARDED");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_VIA");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }

        // X-Forwarded-For에 여러 IP가 있을 경우 첫 번째 IP 사용
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }

        return ip;
    }
}