package com.example.Project2_Spring.repository;

import com.example.Project2_Spring.entity.BackofficeUserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

// ─────────────────────────────────────────────────────────────────
// 백오피스 관리자 계정 데이터베이스 접근 계층
// JpaRepository 상속으로 기본 CRUD 자동 제공
// ─────────────────────────────────────────────────────────────────
@Repository
public interface BackofficeUserInfoRepository extends JpaRepository<BackofficeUserInfo, Integer> {

    // ── 로그인용: id 컬럼으로 관리자 계정 조회 ──
    @Query("SELECT u FROM BackofficeUserInfo u WHERE u.id = :id")
    Optional<BackofficeUserInfo> findByLoginId(@Param("id") String id);

    // ── 아이디 중복 확인 ──
    @Query("SELECT COUNT(u) > 0 FROM BackofficeUserInfo u WHERE u.id = :id")
    boolean existsByLoginId(@Param("id") String id);
}