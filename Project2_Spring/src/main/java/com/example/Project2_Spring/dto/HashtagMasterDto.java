package com.example.Project2_Spring.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

// 해시태그 마스터 목록 응답용 DTO
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HashtagMasterDto {

    private Integer idx;
    private String name;
    // 해당 태그가 등록된 점포 수
    private Integer useCount;
    private LocalDateTime regDate;
}
