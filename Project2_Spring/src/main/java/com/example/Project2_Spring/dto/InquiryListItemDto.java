package com.example.Project2_Spring.dto;

import lombok.*;
import java.time.LocalDateTime;

// 고객 문의 목록 응답 DTO
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InquiryListItemDto {

    private Integer       idx;
    private Integer       state;
    private String        stateName;       // "대기중" | "처리중" | "완료" | "기각"
    private String        title;
    private Integer       isPublic;
    private Integer       inquiryType;
    private String        inquiryTypeName; // 문의유형 한글명
    private boolean       hasAnswer;       // 답변 존재 여부
    private LocalDateTime regDate;
}
