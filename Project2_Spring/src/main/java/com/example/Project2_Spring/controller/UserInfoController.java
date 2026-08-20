package com.example.Project2_Spring.controller;

import com.example.Project2_Spring.dto.UserDto;
import com.example.Project2_Spring.entity.UserInfo;
import com.example.Project2_Spring.service.UserInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController // JSON 응답을 위한 컨트롤러 [cite: 11, 121]
@RequestMapping("/api/user") // 공통 URL 경로 설정 [cite: 118]
@RequiredArgsConstructor
public class UserInfoController {

    private final UserInfoService userInfoService;

    /**
     * 1. 회원가입 API
     * POST http://localhost:8080/api/user/signup
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody UserDto userDto) {
        try {
            // React에서 받은 DTO를 Entity로 변환
            UserInfo userInfo = new UserInfo();
            userInfo.setUserId(userDto.getUserId());
            userInfo.setPassword(userDto.getPassword()); // Service에서 암호화됨
            userInfo.setNickname(userDto.getNickname()); // ✨ 추가됨
            userInfo.setEmail(userDto.getEmail());       // ✨ 추가됨
            userInfo.setPhoneNumber(userDto.getPhoneNumber());

            // Service에서 중복 체크 및 비밀번호 암호화, DB 저장 처리
            UserInfo savedUser = userInfoService.join(userInfo);

            // 응답 JSON 구성
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "회원가입 성공");
            response.put("userId", savedUser.getUserId());
            response.put("nickname", savedUser.getNickname());

            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            // 아이디 또는 이메일 중복 시 발생
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            // 기타 에러 처리
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "회원가입 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * 2. 프로필 조회 API
     * GET /api/user/profile/{userId}
     */
    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable String userId) {
        try {
            UserInfo user = userInfoService.getUserInfo(userId);

            Map<String, Object> data = new HashMap<>();
            data.put("userId",          user.getUserId());
            data.put("nickname",         user.getNickname());
            data.put("phoneNumber",      user.getPhoneNumber());
            data.put("email",            user.getEmail());
            data.put("profileImageUrl",  user.getProfileImageUrl());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data",    data);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "프로필 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * 3. 프로필 수정 API (닉네임, 전화번호, 이메일)
     * PUT /api/user/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UserDto userDto) {
        try {
            userInfoService.updateProfile(
                    userDto.getUserId(),
                    userDto.getNickname(),
                    userDto.getPhoneNumber(),
                    userDto.getEmail()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "프로필이 수정되었습니다.");
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "프로필 수정 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * 4. 프로필 이미지 업로드 API
     * POST /api/user/profile/image
     */
    @PostMapping("/profile/image")
    public ResponseEntity<?> uploadProfileImage(
            @RequestParam("userId") String userId,
            @RequestParam("profileImage") MultipartFile file
    ) {
        try {
            String imageUrl = userInfoService.uploadProfileImage(userId, file);

            Map<String, Object> data = new HashMap<>();
            data.put("imageUrl", imageUrl);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "프로필 이미지가 업로드되었습니다.");
            response.put("data",    data);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "이미지 업로드 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * 5. 로그인 API
     * POST http://localhost:8080/api/user/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDto userDto) {
        try {
            UserInfo user = userInfoService.login(userDto.getUserId(), userDto.getPassword());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "로그인 성공");
            response.put("userId", user.getUserId());
            response.put("nickname", user.getNickname());
            response.put("profileImageUrl", user.getProfileImageUrl());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(401).body(error);
        }
    }
}