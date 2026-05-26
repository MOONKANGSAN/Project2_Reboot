package com.example.Project2_Spring.service;

import com.example.Project2_Spring.dto.ErrorLogDto;
import com.example.Project2_Spring.entity.ErrorLog;
import com.example.Project2_Spring.repository.ErrorLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 에러 로그 서비스
 * 에러 발생 시 DB에 저장하고 조회하는 비즈니스 로직 처리
 */
@Slf4j // 로그 출력을 위한 Lombok 어노테이션
@Service
@RequiredArgsConstructor
public class ErrorLogService {

    private final ErrorLogRepository errorLogRepository;

    /**
     * 에러 로그 저장
     * React 프론트엔드 또는 백엔드에서 발생한 에러를 DB에 기록
     *
     * @param errorLogDto 에러 정보 DTO
     * @param ipAddress 사용자 IP 주소 (백엔드에서 자동 추출)
     * @return 저장된 ErrorLog 엔티티
     */
    @Transactional
    public ErrorLog saveErrorLog(ErrorLogDto errorLogDto, String ipAddress) {
        try {
            // DTO를 Entity로 변환하여 저장
            ErrorLog errorLog = ErrorLog.builder()
                    .errorSource(errorLogDto.getErrorSource())
                    .errorType(errorLogDto.getErrorType())
                    .errorMessage(maskSensitiveData(errorLogDto.getErrorMessage()))
                    .errorDetails(maskSensitiveData(errorLogDto.getErrorDetails()))
                    .statusCode(errorLogDto.getStatusCode())
                    .requestUrl(errorLogDto.getRequestUrl())
                    .httpMethod(errorLogDto.getHttpMethod())
                    .requestBody(maskSensitiveData(errorLogDto.getRequestBody()))
                    .userId(errorLogDto.getUserId())
                    .userAgent(errorLogDto.getUserAgent())
                    .ipAddress(ipAddress) // 백엔드에서 추출한 실제 IP
                    .build();

            ErrorLog savedLog = errorLogRepository.save(errorLog);

            // 콘솔에도 에러 로그 출력 (개발 환경에서 확인용)
            log.error("Error logged - Source: {}, Type: {}, Message: {}",
                    errorLogDto.getErrorSource(),
                    errorLogDto.getErrorType(),
                    errorLogDto.getErrorMessage());

            return savedLog;

        } catch (Exception e) {
            // 에러 로깅 자체가 실패해도 앱이 중단되지 않도록 예외 처리
            log.error("Failed to save error log: {}", e.getMessage());
            throw new RuntimeException("에러 로그 저장 실패", e);
        }
    }

    /**
     * 민감한 정보 마스킹 처리
     * 비밀번호, 토큰, 개인정보 등을 *** 로 치환
     *
     * @param data 원본 데이터
     * @return 마스킹 처리된 데이터
     */
    private String maskSensitiveData(String data) {
        if (data == null || data.isEmpty()) {
            return data;
        }

        // 비밀번호 필드 마스킹: "password":"abc123" → "password":"***"
        String masked = data.replaceAll(
                "\"password\"\\s*:\\s*\"[^\"]*\"",
                "\"password\":\"***\""
        );

        // 토큰 필드 마스킹: "token":"xyz..." → "token":"***"
        masked = masked.replaceAll(
                "\"token\"\\s*:\\s*\"[^\"]*\"",
                "\"token\":\"***\""
        );

        // Authorization 헤더 마스킹
        masked = masked.replaceAll(
                "\"Authorization\"\\s*:\\s*\"[^\"]*\"",
                "\"Authorization\":\"***\""
        );

        return masked;
    }

    /**
     * 특정 사용자의 에러 로그 조회
     */
    public List<ErrorLog> getUserErrorLogs(String userId) {
        return errorLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * 특정 기간 내 에러 로그 조회
     */
    public List<ErrorLog> getErrorLogsByDateRange(LocalDateTime start, LocalDateTime end) {
        return errorLogRepository.findByCreatedAtBetween(start, end);
    }

    /**
     * 미해결 에러 목록 조회
     */
    public List<ErrorLog> getUnresolvedErrors() {
        return errorLogRepository.findByIsResolved(0);
    }

    /**
     * 에러 해결 상태 업데이트
     */
    @Transactional
    public void markAsResolved(Long errorLogId) {
        ErrorLog errorLog = errorLogRepository.findById(errorLogId)
                .orElseThrow(() -> new IllegalArgumentException("해당 에러 로그를 찾을 수 없습니다."));
        errorLog.setIsResolved(1);
        errorLogRepository.save(errorLog);
    }

    /**
     * 프론트엔드 소스 에러만 조회
     */
    public List<ErrorLog> getFrontendErrors() {
        return errorLogRepository.findByErrorSource("FRONTEND");
    }

    /**
     * 백엔드 소스 에러만 조회
     */
    public List<ErrorLog> getBackendErrors() {
        return errorLogRepository.findByErrorSource("BACKEND");
    }
}