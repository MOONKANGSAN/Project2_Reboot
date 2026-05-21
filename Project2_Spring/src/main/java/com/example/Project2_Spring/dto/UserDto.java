package com.example.Project2_Spring.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class UserDto {
    // 회원가입 및 로그인 요청 시 사용할 필드
    // ─────────────────────────────────────────
    // 로그인/회원가입에 필요한 필드
    // ─────────────────────────────────────────

    // 로그인 아이디 (4-20자, 영문 소문자 + 숫자)
    private String userId;

    // 암호화되기 전의 원본 비밀번호 (8-20자)
    private String password;

    // ─────────────────────────────────────────
    // 회원가입 시에만 필요한 필드
    // ─────────────────────────────────────────

    // 사용자 닉네임 (2-10자)
    private String nickname;

    // 사용자 이메일
    private String email;

    // 휴대폰 번호 (010-XXXX-XXXX 형식)
    private String phoneNumber;
}