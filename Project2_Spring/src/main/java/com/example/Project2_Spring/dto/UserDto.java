package com.example.Project2_Spring.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDto {
    // 회원가입 및 로그인 요청 시 사용할 필드
    private String userId;
    private String password;
    private String phoneNumber;
}