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
    name = "review_report",
    uniqueConstraints = @UniqueConstraint(columnNames = {"review_idx", "reporter_idx"})
)
public class ReviewReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idx;

    // 신고 대상 리뷰
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_idx", nullable = false)
    private Review review;

    // 신고자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_idx", nullable = false)
    private UserInfo reporter;

    // 신고 유형 (ABUSE / IRRELEVANT / OBSCENE / ETC)
    @Column(name = "report_type", length = 20, nullable = false)
    private String reportType;

    // 기타 신고 시 직접 입력 내용 (ETC 일 때만 값 존재)
    @Column(name = "custom_content", columnDefinition = "TEXT")
    private String customContent;

    // 처리 상태 (0=대기중, 1=처리완료, 2=기각)
    @Column(name = "state", columnDefinition = "TINYINT", nullable = false)
    private Integer state;

    @Column(name = "reg_date", updatable = false)
    private LocalDateTime regDate;

    @PrePersist
    public void prePersist() {
        this.regDate = LocalDateTime.now();
        if (this.state == null) this.state = 0;
    }
}
