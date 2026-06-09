package com.example.Project2_Spring.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

// 백오피스 리뷰 목록 응답 DTO
@Getter
@AllArgsConstructor
public class BackofficeReviewListItemDto {

    private Integer       idx;
    private Integer       restaurantIdx;
    private String        restaurantName;
    private String        nickname;       // 작성자 닉네임
    private Integer       rating;
    private String        content;
    private Integer       likeCount;
    private Boolean       hasImage;       // 이미지 존재 여부 (URL 대신 boolean)
    private Integer       state;          // 1=활성, 0=비활성
    private LocalDateTime regDate;
}
