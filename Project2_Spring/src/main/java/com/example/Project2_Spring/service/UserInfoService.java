package com.example.Project2_Spring.service; // ⚠️ 본인의 실제 패키지 경로로 수정하세요!

import com.example.Project2_Spring.dto.UserListItemDto;
import com.example.Project2_Spring.entity.UserInfo;
import com.example.Project2_Spring.repository.UserInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

// 비즈니스 로직 처리 계층
// Controller ← Service → Repository → Database
@Service
@RequiredArgsConstructor // final이 붙은 필드(Repository, PasswordEncoder)를 생성자로 자동 주입
public class UserInfoService {

    private final UserInfoRepository userInfoRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${app.upload.user.dir}")
    private String userUploadDir;

    private static final List<String> ALLOWED_IMG_EXT = List.of(".jpg", ".jpeg", ".png", ".webp", ".gif");

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

    // ─────────────────────────────────────────────────────────────────
    // 7. 프로필 수정 (닉네임, 전화번호, 이메일)
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public void updateProfile(String userId, String nickname, String phoneNumber, String email) {
        UserInfo user = userInfoRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 이메일이 변경됐고 다른 사용자가 이미 사용 중이면 거부
        if (!user.getEmail().equals(email) && userInfoRepository.existsByEmail(email)) {
            throw new IllegalStateException("이미 사용 중인 이메일입니다.");
        }

        // 전화번호가 변경됐고 다른 사용자가 이미 사용 중이면 거부
        if (phoneNumber != null && !phoneNumber.equals(user.getPhoneNumber())
                && userInfoRepository.existsByPhoneNumber(phoneNumber)) {
            throw new IllegalStateException("이미 사용 중인 전화번호입니다.");
        }

        user.setNickname(nickname);
        user.setPhoneNumber(phoneNumber);
        user.setEmail(email);
        // @Transactional + Dirty Checking으로 자동 UPDATE
    }

    // ─────────────────────────────────────────────────────────────────
    // 8. 프로필 이미지 업로드 — UUID 파일명으로 저장 후 URL 반환
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public String uploadProfileImage(String userId, MultipartFile file) throws IOException {
        UserInfo user = userInfoRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "image");
        int dotIdx = originalFilename.lastIndexOf('.');
        String ext = (dotIdx >= 0) ? originalFilename.substring(dotIdx).toLowerCase() : "";
        if (!ALLOWED_IMG_EXT.contains(ext)) {
            throw new IllegalArgumentException("허용되지 않는 파일 형식입니다: " + ext);
        }

        Path uploadPath = Paths.get(userUploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 기존 이미지 파일 삭제
        if (user.getProfileImageUrl() != null) {
            String oldFilename = user.getProfileImageUrl().substring(
                    user.getProfileImageUrl().lastIndexOf('/') + 1);
            Files.deleteIfExists(uploadPath.resolve(oldFilename));
        }

        String savedFilename = UUID.randomUUID() + ext;
        Files.copy(file.getInputStream(), uploadPath.resolve(savedFilename),
                StandardCopyOption.REPLACE_EXISTING);

        String imageUrl = "/uploads/user/" + savedFilename;
        user.setProfileImageUrl(imageUrl);
        return imageUrl;
    }

    // ─────────────────────────────────────────────────────────────────
    // 9. 백오피스 회원 목록 조회 (최신 가입순)
    //    keyword가 있으면 아이디/닉네임 검색, 없으면 전체 조회
    // ─────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<UserListItemDto> getUserList(String keyword) {
        List<UserInfo> users = (keyword != null && !keyword.isBlank())
                ? userInfoRepository
                        .findByUserIdContainingIgnoreCaseOrNicknameContainingIgnoreCaseOrderByRegDateDesc(
                                keyword, keyword)
                : userInfoRepository.findAllByOrderByRegDateDesc();

        return users.stream()
                .map(u -> new UserListItemDto(
                        u.getIdx(),
                        u.getUserId(),
                        u.getNickname(),
                        u.getEmail(),
                        u.getPhoneNumber(),
                        u.getState(),
                        u.getRegDate(),
                        u.getEditDate()
                ))
                .collect(Collectors.toList());
    }
}