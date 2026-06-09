package com.example.Project2_Spring.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

// 점포 검색 자동완성 응답 DTO (경량 - 검색 드롭다운 전용)
@Getter
@AllArgsConstructor
public class RestaurantSearchItemDto {
    private Integer idx;
    private String  name;
    private String  category;
    private String  location;
}
