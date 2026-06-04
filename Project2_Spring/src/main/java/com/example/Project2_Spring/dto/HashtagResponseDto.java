package com.example.Project2_Spring.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

// 점포 해시태그 응답용 DTO
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HashtagResponseDto {

    // restaurant_hashtag.idx (삭제 시 사용)
    private Integer restaurantHashtagIdx;

    // hashtag.idx (수정 시 사용)
    private Integer hashtagIdx;

    // hashtag.name
    private String name;

    private Integer state;
    private LocalDateTime regDate;
}
