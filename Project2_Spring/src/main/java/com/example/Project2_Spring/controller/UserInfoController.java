package com.example.Project2_Spring.controller;

import com.example.Project2_Spring.dto.UserDto;
import com.example.Project2_Spring.entity.UserInfo;
import com.example.Project2_Spring.service.UserInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            UserInfo userInfo = new UserInfo();
            userInfo.setUserId(userDto.getUserId());
            userInfo.setPassword(userDto.getPassword()); // ⚠️ 추후 암호화 필수
            userInfo.setPhoneNumber(userDto.getPhoneNumber());

            UserInfo savedUser = userInfoService.join(userInfo);
            return ResponseEntity.ok("회원가입 성공: " + savedUser.getUserId());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
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
            return ResponseEntity.ok(user.getUserId() + "님 환영합니다!");
        } catch (Exception e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }
}