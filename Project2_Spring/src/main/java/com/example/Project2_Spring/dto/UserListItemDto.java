package com.example.Project2_Spring.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

// 백오피스 회원 목록 응답용 DTO (비밀번호 필드 제외)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserListItemDto {

    private Integer idx;
    private String userId;
    private String nickname;
    private String email;
    private String phoneNumber;
    // 상태 (1=활성, 0=비활성)
    private Integer state;
    private LocalDateTime regDate;
    private LocalDateTime editDate;
}
