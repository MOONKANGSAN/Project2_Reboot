package com.example.Project2_Spring.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

// 점포 목록 조회 응답용 DTO (idx, 상태, 등록일 포함)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantListItemDto {

    private Integer idx;
    private String name;
    private String category;
    private String address;
    private String location;
    private String phone;
    private String priceRange;
    private String description;
    private String imageUrl;
    private Integer imgIdx;
    private Double latitude;
    private Double longitude;
    private Integer state;
    private LocalDateTime regDate;
}
