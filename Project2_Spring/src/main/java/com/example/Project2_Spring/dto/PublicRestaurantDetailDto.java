package com.example.Project2_Spring.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

// 고객 서비스 점포 상세 조회 응답 DTO
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PublicRestaurantDetailDto {

    private Integer idx;
    private String name;
    private String category;
    private String address;
    private String location;
    private String phone;
    private String priceRange;
    private String description;
    private String imageUrl;
    private Double avgRating;
    private Double latitude;
    private Double longitude;
    private List<String> hashtags;
    private LocalDateTime regDate;
}
