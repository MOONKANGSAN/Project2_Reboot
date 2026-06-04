package com.example.Project2_Spring.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantDto {

    private String name;
    private String category;
    private String address;
    private String location;
    private String phone;
    private String priceRange;
    private String description;
    private String imageUrl;
    // 점포 등록/수정 시 함께 저장할 해시태그 이름 목록
    private List<String> hashtags;
}
