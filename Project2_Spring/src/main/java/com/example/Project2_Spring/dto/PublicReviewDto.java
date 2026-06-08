package com.example.Project2_Spring.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

// 공개 리뷰 목록 API 응답 DTO
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PublicReviewDto {

    private Integer idx;

    // 점포 정보 (필터링에 필요)
    private Integer restaurantIdx;
    private String  restaurantName;
    private String  restaurantCategory;
    private String  restaurantLocation;
    private String  restaurantImageUrl;

    // 작성자
    private String  nickname;

    // 리뷰 내용
    private Integer rating;
    private String  content;
    private Integer likeCount;
    private String  imageUrl;

    // 날짜 (표시는 reg_date 기준)
    private LocalDateTime regDate;
}
