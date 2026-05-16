package com.example.Project2_Spring.service; // ⚠️ 본인의 실제 패키지 경로로 수정하세요!

import com.example.Project2_Spring.entity.UserInfo;
import com.example.Project2_Spring.repository.UserInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor // final이 붙은 필드(Repository)를 자동으로 주입해줍니다.
public class UserInfoService {

    private final UserInfoRepository userInfoRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    /**
     * 1. 회원가입 로직
     */
    @Transactional
    public UserInfo join(UserInfo userInfo) {
        // 아이디 중복 체크
        if (userInfoRepository.existsByUserId(userInfo.getUserId())) {
            throw new IllegalStateException("이미 존재하는 아이디입니다.");
        }

        // 🔐 비밀번호 암호화 처리 [cite: 35, 81, 152]
        String encodedPassword = passwordEncoder.encode(userInfo.getPassword());
        userInfo.setPassword(encodedPassword);

        // 실제 저장 (이때 DB에 데이터가 들어갑니다)
        return userInfoRepository.save(userInfo);
    }

    /**
     * 2. 로그인 로직 (간단 버전)
     */
    public UserInfo login(String userId, String password) {
        return userInfoRepository.findByUserId(userId)
                .filter(u -> u.getPassword().equals(password)) // 비밀번호 일치 확인
                .filter(u -> u.getState() == 1)               // 사용 가능 상태(1) 확인
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 틀렸거나 비활성화된 계정입니다."));
    }

    /**
     * 3. 회원 정보 수정
     */
    @Transactional
    public void updateUserInfo(String userId, String rawPassword) {

        UserInfo user = userInfoRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 틀렸습니다."));

        // 암호화된 비번과 입력받은 비번 대조 [cite: 284, 296]
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 틀렸습니다.");
        }

        if (user.getState() == 0) { // 비활성화 계정 체크 [cite: 153]
            throw new IllegalArgumentException("비활성화된 계정입니다.");
        }


        // @Transactional 덕분에 별도의 save 호출 없이도 메서드가 끝나면 DB에 반영됩니다 (Dirty Checking)
    }
}