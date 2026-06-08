package com.example.Project2_Spring.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

// 리뷰 작성 요청 DTO
// multipart/form-data 로 받으므로 @RequestParam 과 함께 사용
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDto {

    private Integer restaurantIdx; // 점포 idx
    private String  userId;        // 작성자 userId (sessionStorage에서 전달)
    private Integer rating;        // 별점 1~5
    private String  content;       // 리뷰 본문
}
