package com.example.Project2_Spring.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

// ─────────────────────────────────────────────────────────────────
// 백오피스 관리자 계정 엔티티
// DB 테이블: backoff_userinfo
// 가입은 Postman 또는 MySQL에서 직접 INSERT하여 생성
// ─────────────────────────────────────────────────────────────────
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "backoff_userinfo") // DB 테이블명 매핑
public class BackofficeUserInfo {

    // 자동 증가 PK
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idx;

    // 관리자 로그인 아이디 (중복 불가)
    @Column(name = "id", length = 50, nullable = false, unique = true)
    private String id;

    // BCrypt 해싱된 비밀번호 (평문 저장 금지)
    @Column(name = "password", length = 200, nullable = false)
    private String password;

    // 계정 생성 일시 (INSERT 시 자동 설정, 이후 수정 불가)
    @Column(name = "reg_date", updatable = false)
    private LocalDateTime regDate;

    // 관리자 권한 레벨 (예: 1=일반관리자, 2=슈퍼관리자 등 운영 정책에 따라 정의)
    @Column(name = "level", columnDefinition = "TINYINT", nullable = false)
    private Integer level;

    // 계정 활성 상태 (1=활성, 0=비활성)
    @Column(name = "state", columnDefinition = "TINYINT", nullable = false)
    private Integer state;

    // ─────────────────────────────────────────────────────────────
    // INSERT 직전 자동 실행 - reg_date, state, level 기본값 세팅
    // Postman/MySQL에서 직접 입력할 경우에는 수동으로 값을 넣어야 함
    // ─────────────────────────────────────────────────────────────
    @PrePersist
    public void prePersist() {
        // 등록 시간 자동 설정
        this.regDate = LocalDateTime.now();

        // state 미입력 시 기본값 1(활성)
        if (this.state == null) {
            this.state = 1;
        }

        // level 미입력 시 기본값 1(일반관리자)
        if (this.level == null) {
            this.level = 1;
        }
    }
}