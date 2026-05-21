package com.example.Project2_Spring.service; // ⚠️ 본인의 실제 패키지 경로로 수정하세요!

import com.example.Project2_Spring.entity.UserInfo;
import com.example.Project2_Spring.repository.UserInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

// 비즈니스 로직 처리 계층
// Controller ← Service → Repository → Database
@Service
@RequiredArgsConstructor // final이 붙은 필드(Repository, PasswordEncoder)를 생성자로 자동 주입
public class UserInfoService {

    private final UserInfoRepository userInfoRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    // ─────────────────────────────────────────────────────────────────
    // 1. 회원가입 로직
    // ─────────────────────────────────────────────────────────────────
    // @Transactional: 메소드 실행 중 에러 발생 시 자동으로 롤백

    @Transactional
    public UserInfo join(UserInfo userInfo) {
        // 아이디 중복 체크
        if (userInfoRepository.existsByUserId(userInfo.getUserId())) {
            throw new IllegalStateException("이미 존재하는 아이디입니다.");
        }

        // 이메일 중복 체크 (✨ 추가됨)
        if (userInfoRepository.existsByEmail(userInfo.getEmail())) {
            throw new IllegalStateException("이미 존재하는 이메일입니다.");
        }

        // 휴대폰 번호 중복 체크 (선택사항)
        if (userInfo.getPhoneNumber() != null &&
                userInfoRepository.existsByPhoneNumber(userInfo.getPhoneNumber())) {
            throw new IllegalStateException("이미 등록된 휴대폰 번호입니다.");
        }

        // 🔐 비밀번호 암호화 처리
        // 평문 비밀번호를 BCrypt 알고리즘으로 암호화
        // 저장된 암호화된 비밀번호를 다시 평문으로 복호화할 수 없음 (단방향 암호화)
        String encodedPassword = passwordEncoder.encode(userInfo.getPassword());
        userInfo.setPassword(encodedPassword);

        // DB에 실제 저장
        // JpaRepository.save()를 호출하면:
        // - INSERT 쿼리 실행
        // - Entity의 @PrePersist 메소드 자동 실행
        // - regDate와 state가 자동으로 설정됨
        return userInfoRepository.save(userInfo);
    }

    // ─────────────────────────────────────────────────────────────────
    // 2. 로그인 로직
    // ─────────────────────────────────────────────────────────────────

    public UserInfo login(String userId, String password) {
        return userInfoRepository.findByUserId(userId)
                // 사용자 아이디로 조회한 UserInfo가 없으면 예외 발생
                .filter(u -> {
                    // 저장된 암호화된 비밀번호와 입력받은 평문 비밀번호 비교
                    // passwordEncoder.matches(평문, 암호화된값)
                    return passwordEncoder.matches(password, u.getPassword());
                })
                // 계정 상태 확인 (1: 활성화, 0: 비활성화)
                .filter(u -> u.getState() == 1)
                // 위 조건들을 만족하지 못하면 예외 발생
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 틀렸거나 비활성화된 계정입니다."));
    }

    // ─────────────────────────────────────────────────────────────────
    // 3. 사용자 정보 조회
    // ─────────────────────────────────────────────────────────────────

    public UserInfo getUserInfo(String userId) {
        return userInfoRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    // ─────────────────────────────────────────────────────────────────
    // 4. 회원 정보 수정
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public void updateUserInfo(String userId, String rawPassword) {
        // 아이디로 사용자 조회
        UserInfo user = userInfoRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 암호화된 비번과 입력받은 비번 대조
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 틀렸습니다.");
        }

        // 비활성화 계정 체크
        if (user.getState() == 0) {
            throw new IllegalArgumentException("비활성화된 계정입니다.");
        }

        // @Transactional 덕분에 객체의 상태 변경만으로 DB에 반영됨
        // Dirty Checking: 메소드 종료 후 자동으로 UPDATE 쿼리 실행
    }

    // ─────────────────────────────────────────────────────────────────
    // 5. 아이디 중복 확인
    // ─────────────────────────────────────────────────────────────────

    public boolean checkUserIdExists(String userId) {
        return userInfoRepository.existsByUserId(userId);
    }

    // ─────────────────────────────────────────────────────────────────
    // 6. 이메일 중복 확인
    // ─────────────────────────────────────────────────────────────────

    public boolean checkEmailExists(String email) {
        return userInfoRepository.existsByEmail(email);
    }
}