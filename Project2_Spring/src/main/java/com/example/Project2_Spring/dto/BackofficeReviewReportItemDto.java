package com.example.Project2_Spring.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

// 백오피스 신고 목록 응답 DTO
@Getter
@AllArgsConstructor
public class BackofficeReviewReportItemDto {

    private Integer       idx;
    private Integer       reviewIdx;
    private String        reviewContent;    // 리뷰 내용 (말줄임 처리는 프론트에서)
    private String        restaurantName;
    private String        reporterNickname; // 신고자 닉네임
    private String        reportType;       // ABUSE / IRRELEVANT / OBSCENE / ETC
    private String        customContent;    // 기타 직접 입력 내용 (ETC 일 때)
    private Integer       state;            // 0=대기중, 1=처리완료, 2=기각
    private LocalDateTime regDate;
}
