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
@Table(name = "restaurant")
public class restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idx;

    // 점포명
    @Column(name = "name", length = 100, nullable = false)
    private String name;

    // 카테고리 (한식/일식/중식/양식/카페/분식)
    @Column(name = "category", length = 20, nullable = false)
    private String category;

    // 상세 주소
    @Column(name = "address", length = 200, nullable = false)
    private String address;

    // 지역명 (예: 강남, 홍대)
    @Column(name = "location", length = 50, nullable = false)
    private String location;

    // 전화번호
    @Column(name = "phone", length = 20, nullable = false)
    private String phone;

    // 가격대 (₩ / ₩₩ / ₩₩₩ / ₩₩₩₩)
    @Column(name = "price_range", length = 10)
    private String priceRange;

    // 소개글
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // 대표 이미지 URL (추후 S3 연동)
    @Column(name = "image_url", length = 300)
    private String imageUrl;

    // 대표 이미지 idx (restaurant_img.idx 참조, 애플리케이션 레벨에서 관리)
    @Column(name = "img_idx")
    private Integer imgIdx;

    // 평균 별점 (스케줄러가 매일 00:00 review 테이블로부터 갱신)
    @Column(name = "avg_rating")
    private Double avgRating;

    // 상태 (1=활성, 0=비활성)
    @Column(name = "state", columnDefinition = "TINYINT", nullable = false)
    private Integer state;

    // 등록일
    @Column(name = "reg_date", updatable = false)
    private LocalDateTime regDate;

    // 수정일
    @Column(name = "edit_date")
    private LocalDateTime editDate;

    @PrePersist
    public void prePersist() {
        this.regDate = LocalDateTime.now();
        if (this.state == null) {
            this.state = 1;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.editDate = LocalDateTime.now();
    }
}
