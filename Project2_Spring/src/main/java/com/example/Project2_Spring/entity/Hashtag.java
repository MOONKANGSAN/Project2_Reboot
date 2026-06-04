package com.example.Project2_Spring.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "hashtag")
public class Hashtag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idx;

    // 해시태그명 (예: "가성비", "혼밥", "데이트") — 중복 불가
    @Column(name = "name", length = 30, unique = true, nullable = false)
    private String name;

    // 사용 횟수 — 인기 태그 정렬 및 추천에 활용
    @Column(name = "use_count", nullable = false)
    private Integer useCount;

    // 등록일
    @Column(name = "reg_date", updatable = false)
    private LocalDateTime regDate;

    @PrePersist
    public void prePersist() {
        this.regDate = LocalDateTime.now();
        if (this.useCount == null) {
            this.useCount = 0;
        }
    }
}
