package com.example.Project2_Spring.repository;

import com.example.Project2_Spring.entity.ErrorLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 에러 로그 데이터베이스 접근 계층
 * JpaRepository를 상속하여 기본 CRUD 메소드 자동 제공
 */
@Repository
public interface ErrorLogRepository extends JpaRepository<ErrorLog, Long> {

    /**
     * 특정 사용자의 에러 로그 조회
     * SELECT * FROM error_log WHERE user_id = ? ORDER BY created_at DESC
     */
    List<ErrorLog> findByUserIdOrderByCreatedAtDesc(String userId);

    /**
     * 특정 기간 내 발생한 에러 로그 조회
     * SELECT * FROM error_log WHERE created_at BETWEEN ? AND ?
     */
    List<ErrorLog> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    /**
     * 에러 소스별 조회 (FRONTEND 또는 BACKEND)
     * SELECT * FROM error_log WHERE error_source = ?
     */
    List<ErrorLog> findByErrorSource(String errorSource);

    /**
     * 미해결 에러 조회
     * SELECT * FROM error_log WHERE is_resolved = 0
     */
    List<ErrorLog> findByIsResolved(Integer isResolved);

    /**
     * 에러 유형별 조회
     * SELECT * FROM error_log WHERE error_type = ?
     */
    List<ErrorLog> findByErrorType(String errorType);
}