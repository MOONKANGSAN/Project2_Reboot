package com.example.Project2_Spring.controller;

import com.example.Project2_Spring.dto.UserListItemDto;
import com.example.Project2_Spring.service.UserInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

// 백오피스 회원 관리 전용 컨트롤러 (/api/backoffice/user)
@RestController
@RequestMapping("/api/backoffice/user")
@RequiredArgsConstructor
public class BackofficeUserController {

    private final UserInfoService userInfoService;

    // GET /api/backoffice/user/list?keyword=
    // keyword 없으면 전체 조회, 있으면 아이디·닉네임 검색
    @GetMapping("/list")
    public ResponseEntity<?> list(@RequestParam(required = false) String keyword) {
        try {
            List<UserListItemDto> data = userInfoService.getUserList(keyword);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            response.put("total", data.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "회원 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(error);
        }
    }
}
