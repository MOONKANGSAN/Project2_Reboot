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
@Table(
    name = "restaurant_hashtag",
    uniqueConstraints = {
        // 동일 점포에 같은 해시태그가 중복 등록되지 않도록 유니크 제약
        @UniqueConstraint(columnNames = {"restaurant_idx", "hashtag_idx"})
    }
)
public class RestaurantHashtag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idx;

    // 점포 참조 (restaurant.idx)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_idx", nullable = false)
    private restaurant restaurantEntity;

    // 해시태그 참조 (hashtag.idx)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hashtag_idx", nullable = false)
    private Hashtag hashtag;

    // 상태 (1=활성, 0=비활성)
    @Column(name = "state", columnDefinition = "TINYINT", nullable = false)
    private Integer state;

    // 등록일
    @Column(name = "reg_date", updatable = false)
    private LocalDateTime regDate;

    @PrePersist
    public void prePersist() {
        this.regDate = LocalDateTime.now();
        if (this.state == null) {
            this.state = 1;
        }
    }
}
