package com.example.Project2_Spring.controller;

import com.example.Project2_Spring.dto.UserDto;
import com.example.Project2_Spring.entity.UserInfo;
import com.example.Project2_Spring.service.UserInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
     * 2. 로그인 API
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

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(401).body(error);
        }
    }
}