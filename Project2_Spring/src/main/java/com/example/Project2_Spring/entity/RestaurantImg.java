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
@Table(name = "restaurant_img")
public class RestaurantImg {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idx;

    // 어느 점포의 이미지인지 restaurant.idx 참조
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_idx", nullable = false)
    private restaurant restaurantEntity;

    // 실제 이미지 파일 경로 또는 URL (추후 S3 경로)
    @Column(name = "img_url", length = 500, nullable = false)
    private String imgUrl;

    // 이미지 표시 순서 (낮을수록 앞에 노출)
    @Column(name = "img_order", nullable = false)
    private Integer imgOrder;

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
        if (this.imgOrder == null) {
            this.imgOrder = 0;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.editDate = LocalDateTime.now();
    }
}
