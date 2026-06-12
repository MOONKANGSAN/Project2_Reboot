package com.example.Project2_Spring.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "inquiry")
public class Inquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idx;

    // 작성자 — nullable (비회원 문의 허용)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_idx")
    private UserInfo userEntity;

    // 처리 상태 (0=대기중, 1=처리중, 2=완료, 3=기각)
    @Column(name = "state", columnDefinition = "TINYINT", nullable = false)
    private Integer state;

    // 문의 제목
    @Column(name = "title", length = 200, nullable = false)
    private String title;

    // 문의 내용
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    // 공개 여부 (0=비공개, 1=공개)
    @Column(name = "is_public", columnDefinition = "TINYINT", nullable = false)
    private Integer isPublic;

    // 문의 유형 (1~9)
    @Column(name = "inquiry_type", columnDefinition = "TINYINT", nullable = false)
    private Integer inquiryType;

    // 비공개 문의용 비밀번호 (BCrypt 암호화 저장)
    @Column(name = "password", length = 200)
    private String password;

    // 답변 내용 (백오피스에서 작성)
    @Column(name = "answer_content", columnDefinition = "TEXT")
    private String answerContent;

    // 답변 일시
    @Column(name = "answered_date")
    private LocalDateTime answeredDate;

    @Column(name = "reg_date", updatable = false)
    private LocalDateTime regDate;

    @Column(name = "edit_date")
    private LocalDateTime editDate;

    @PrePersist
    public void prePersist() {
        this.regDate = LocalDateTime.now();
        if (this.state    == null) this.state    = 0;
        if (this.isPublic == null) this.isPublic = 1;
    }

    @PreUpdate
    public void preUpdate() {
        this.editDate = LocalDateTime.now();
    }
}
