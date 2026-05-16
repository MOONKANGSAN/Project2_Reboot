package com.example.Project2_Spring.entity; // ⚠️ 본인의 실제 패키지 경로로 꼭 수정하세요!

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
@Table(name = "user_info") // DB 테이블명 매핑
public class UserInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idx; // 이미지의 int(Primary Key) 반영 [cite: 327]

    @Column(columnDefinition = "TINYINT", nullable = false)
    private Integer state; // 0:비활성화, 1:사용가능 [cite: 327]

    @Column(name = "user_id", length = 50, nullable = false, unique = true)
    private String userId;

    @Column(length = 200, nullable = false)
    private String password;

    @Column(name = "phone_number", length = 13)
    private String phoneNumber;

    @Column(name = "reg_date", updatable = false)
    private LocalDateTime regDate; // [cite: 34, 287]

    @Column(name = "edit_date")
    private LocalDateTime editDate;

    // 데이터 저장 전 자동으로 실행되는 메소드
    @PrePersist
    public void prePersist() {
        this.regDate = LocalDateTime.now(); // 등록 시간 자동 설정 [cite: 66, 339]
        if (this.state == null) {
            this.state = 1; // 기본값: 사용가능(1) [cite: 327]
        }
    }

    // 데이터 수정 전 자동으로 실행되는 메소드
    @PreUpdate
    public void preUpdate() {
        this.editDate = LocalDateTime.now(); // 수정 시간 자동 갱신
    }
}