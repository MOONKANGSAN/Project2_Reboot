package com.example.Project2_Spring.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * 에러 로그 DTO
 * React 프론트엔드에서 에러 발생 시 전송하는 데이터 구조
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorLogDto {

    // 에러가 발생한 위치: "FRONTEND" 또는 "BACKEND"
    private String errorSource;

    // 에러 유형: "NETWORK", "VALIDATION", "SERVER", "CLIENT" 등
    private String errorType;

    // 에러 메시지
    private String errorMessage;

    // 에러 상세 정보 (스택 트레이스 등)
    private String errorDetails;

    // HTTP 상태 코드
    private Integer statusCode;

    // 에러가 발생한 URL
    private String requestUrl;

    // HTTP 메서드
    private String httpMethod;

    // 요청 본문 (필요 시)
    private String requestBody;

    // 사용자 ID (로그인한 경우)
    private String userId;

    // 사용자 브라우저 정보
    private String userAgent;

    // 사용자 IP 주소 (프론트엔드에서는 보통 null, 백엔드에서 채움)
    private String ipAddress;
}