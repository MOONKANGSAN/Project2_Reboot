package com.example.Project2_Spring.dto;

import lombok.*;

// 고객 문의 작성 요청 DTO
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InquiryWriteDto {

    private String  userId;       // 로그인 사용자 ID (nullable — 비회원 허용)
    private String  title;
    private String  content;
    private Integer isPublic;     // 0=비공개, 1=공개
    private Integer inquiryType;  // 1~9
    private String  password;     // 비공개 문의 비밀번호 (nullable)
}
