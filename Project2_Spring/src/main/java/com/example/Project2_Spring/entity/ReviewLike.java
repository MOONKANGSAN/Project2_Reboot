package com.example.Project2_Spring.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(
    name = "review_like",
    uniqueConstraints = @UniqueConstraint(columnNames = {"review_idx", "user_idx"})
)
public class ReviewLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idx;

    // 어느 리뷰에 대한 좋아요인지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_idx", nullable = false)
    private Review review;

    // 누가 눌렀는지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_idx", nullable = false)
    private UserInfo user;

    // 1=좋아요 활성, 0=좋아요 해제
    @Column(name = "state", columnDefinition = "TINYINT", nullable = false)
    private Integer state;

    @Column(name = "reg_date", updatable = false)
    private LocalDateTime regDate;

    @PrePersist
    public void prePersist() {
        this.regDate = LocalDateTime.now();
        if (this.state == null) this.state = 1;
    }
}
