package com.example.Project2_Spring.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

// 고객 서비스 공개 API 응답용 DTO
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PublicRestaurantDto {

    private Integer idx;
    private String name;
    private String category;
    // 스케줄러가 매일 갱신하는 평균 별점 (리뷰 없으면 null)
    private Double avgRating;
    private String location;
    private String priceRange;
    private String imageUrl;
    // 해당 점포에 등록된 활성 해시태그 이름 목록
    private List<String> hashtags;
    private LocalDateTime regDate;
}
