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
@Table(name = "review")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idx;

    // 어느 점포의 리뷰인지 restaurant.idx 참조
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_idx", nullable = false)
    private restaurant restaurantEntity;

    // 리뷰를 작성한 회원 user_info.idx 참조
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_idx", nullable = false)
    private UserInfo userEntity;

    // 별점 (1~5)
    @Column(name = "rating", nullable = false)
    private Integer rating;

    // 리뷰 본문
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    // 상태 (1=활성, 0=비활성/삭제)
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
