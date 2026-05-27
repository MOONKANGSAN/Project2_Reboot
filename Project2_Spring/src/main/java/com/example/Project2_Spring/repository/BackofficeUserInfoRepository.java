package com.example.Project2_Spring.repository;

import com.example.Project2_Spring.entity.BackofficeUserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

// ─────────────────────────────────────────────────────────────────
// 백오피스 관리자 계정 데이터베이스 접근 계층
// JpaRepository 상속으로 기본 CRUD 자동 제공
// ─────────────────────────────────────────────────────────────────
@Repository
public interface BackofficeUserInfoRepository extends JpaRepository<BackofficeUserInfo, Integer> {

    // ── 로그인용: 아이디로 관리자 계정 조회 ──
    // SELECT * FROM backoff_userinfo WHERE id = ?
    Optional<BackofficeUserInfo> findById(String id);

    // ── 아이디 중복 확인 (Postman으로 계정 생성 시 중복 방지용) ──
    // SELECT COUNT(*) FROM backoff_userinfo WHERE id = ?
    boolean existsById(String id);
}