package com.example.Project2_Spring.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

// ─────────────────────────────────────────────────────────────────
// 백오피스 관리자 계정 요청 DTO
// 가입 시: id, password, level 사용
// 로그인 시: id, password 사용
// ─────────────────────────────────────────────────────────────────
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BackofficeUserDto {

    // 관리자 로그인 아이디 (4-20자, 영문 소문자 + 숫자)
    private String id;

    // 암호화 전 원본 비밀번호 (Service에서 BCrypt 해싱)
    private String password;

    // 관리자 권한 레벨 (1=일반관리자, 2=슈퍼관리자)
    // 로그인 요청 시에는 사용하지 않음 (null 허용)
    private Integer level;
}