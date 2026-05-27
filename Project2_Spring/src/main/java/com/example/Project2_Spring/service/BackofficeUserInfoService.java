package com.example.Project2_Spring.service;

import com.example.Project2_Spring.entity.BackofficeUserInfo;
import com.example.Project2_Spring.repository.BackofficeUserInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// ─────────────────────────────────────────────────────────────────
// 백오피스 관리자 계정 비즈니스 로직 계층
// Controller ← Service → Repository → Database
// ─────────────────────────────────────────────────────────────────
@Service
@RequiredArgsConstructor // final 필드 생성자 자동 주입
public class BackofficeUserInfoService {

    private final BackofficeUserInfoRepository backofficeUserInfoRepository;

    // SecurityConfig에 @Bean으로 등록된 BCryptPasswordEncoder 주입
    private final BCryptPasswordEncoder passwordEncoder;

    // ─────────────────────────────────────────────────────────────
    // 1. 관리자 계정 가입
    // - 아이디 중복 체크 → 비밀번호 해싱 → DB 저장
    // - @Transactional: 저장 중 오류 발생 시 자동 롤백
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public BackofficeUserInfo signup(BackofficeUserInfo adminInfo) {

        // 아이디 중복 체크
        if (backofficeUserInfoRepository.existsById(adminInfo.getId())) {
            throw new IllegalStateException("이미 존재하는 아이디입니다.");
        }

        // 평문 비밀번호를 BCrypt 알고리즘으로 단방향 암호화
        String encodedPassword = passwordEncoder.encode(adminInfo.getPassword());
        adminInfo.setPassword(encodedPassword);

        // DB 저장 - @PrePersist에서 reg_date, state, level 기본값 자동 세팅
        return backofficeUserInfoRepository.save(adminInfo);
    }

    // ─────────────────────────────────────────────────────────────
    // 2. 관리자 로그인
    // - 아이디 조회 → BCrypt 비밀번호 비교 → 활성 상태 확인
    // ─────────────────────────────────────────────────────────────
    public BackofficeUserInfo login(String id, String rawPassword) {
        return backofficeUserInfoRepository.findById(id)
                // 아이디 미존재 또는 비밀번호 불일치 시 필터링
                .filter(admin -> passwordEncoder.matches(rawPassword, admin.getPassword()))
                // 비활성화 계정(state=0) 차단
                .filter(admin -> admin.getState() == 1)
                .orElseThrow(() -> new IllegalArgumentException(
                        "아이디 또는 비밀번호가 올바르지 않거나 비활성화된 계정입니다."));
    }

    // ─────────────────────────────────────────────────────────────
    // 3. 관리자 계정 단건 조회
    // - 로그인 후 세션 검증 등에 활용
    // ─────────────────────────────────────────────────────────────
    public BackofficeUserInfo getAdminInfo(String id) {
        return backofficeUserInfoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 관리자 계정입니다."));
    }
}