package com.example.Project2_Spring.repository;

import com.example.Project2_Spring.entity.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

// 데이터베이스 접근 계층
// JpaRepository를 상속하면 기본 CRUD 메소드가 자동으로 제공됨
// save(), findById(), findAll(), delete() 등
@Repository
public interface UserInfoRepository extends JpaRepository<UserInfo, Integer> {

    // ─────────────────────────────────────────────────────────────────
    // 아이디 관련 메소드
    // ─────────────────────────────────────────────────────────────────

    // 아이디로 사용자 조회
    // SELECT * FROM user_info WHERE user_id = ?
    Optional<UserInfo> findByUserId(String userId);

    // 아이디 중복 확인
    // SELECT COUNT(*) FROM user_info WHERE user_id = ? (0 또는 1)
    boolean existsByUserId(String userId);

    // ─────────────────────────────────────────────────────────────────
    // 이메일 관련 메소드 (✨ 추가됨)
    // ─────────────────────────────────────────────────────────────────

    // 이메일로 사용자 조회
    // SELECT * FROM user_info WHERE email = ?
    Optional<UserInfo> findByEmail(String email);

    // 이메일 중복 확인
    // SELECT COUNT(*) FROM user_info WHERE email = ? (0 또는 1)
    boolean existsByEmail(String email);

    // ─────────────────────────────────────────────────────────────────
    // 휴대폰 번호 관련 메소드
    // ─────────────────────────────────────────────────────────────────

    // 휴대폰 번호로 사용자 조회
    // SELECT * FROM user_info WHERE phone_number = ?
    Optional<UserInfo> findByPhoneNumber(String phoneNumber);

    // 휴대폰 번호 중복 확인
    // SELECT COUNT(*) FROM user_info WHERE phone_number = ? (0 또는 1)
    boolean existsByPhoneNumber(String phoneNumber);
}