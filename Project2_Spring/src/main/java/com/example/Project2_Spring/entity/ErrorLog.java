package com.example.Project2_Spring.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

/**
 * 에러 로그 엔티티
 * React 프론트엔드에서 발생한 에러 또는 백엔드 에러를 DB에 저장
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "error_log")
public class ErrorLog {

    // 에러 로그 고유 ID (자동 증가)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 에러가 발생한 위치: "FRONTEND" 또는 "BACKEND"
    @Column(name = "error_source", length = 20, nullable = false)
    private String errorSource;

    // 에러 유형: "NETWORK", "VALIDATION", "SERVER", "CLIENT" 등
    @Column(name = "error_type", length = 50)
    private String errorType;

    // 에러 메시지
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    // 에러 상세 스택 트레이스 또는 추가 정보
    @Column(name = "error_details", columnDefinition = "TEXT")
    private String errorDetails;

    // HTTP 상태 코드 (있을 경우)
    @Column(name = "status_code")
    private Integer statusCode;

    // 에러가 발생한 URL 또는 API 엔드포인트
    @Column(name = "request_url", length = 500)
    private String requestUrl;

    // HTTP 메서드: GET, POST, PUT, DELETE 등
    @Column(name = "http_method", length = 10)
    private String httpMethod;

    // 요청 본문 (민감 정보는 마스킹 필요)
    @Column(name = "request_body", columnDefinition = "TEXT")
    private String requestBody;

    // 사용자 ID (로그인한 경우)
    @Column(name = "user_id", length = 50)
    private String userId;

    // 사용자 브라우저 정보 (User-Agent)
    @Column(name = "user_agent", length = 500)
    private String userAgent;

    // 사용자 IP 주소
    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    // 에러 발생 시각
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 에러 해결 여부: 0=미해결, 1=해결됨
    @Column(name = "is_resolved", columnDefinition = "TINYINT DEFAULT 0")
    private Integer isResolved;

    /**
     * 데이터 저장 전 자동으로 실행되는 메소드
     * 에러 발생 시각을 자동으로 설정
     */
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.isResolved == null) {
            this.isResolved = 0; // 기본값: 미해결
        }
    }
}