package com.example.Project2_Spring.service;

import com.example.Project2_Spring.dto.BackofficeReviewReportItemDto;
import com.example.Project2_Spring.entity.Review;
import com.example.Project2_Spring.entity.ReviewReport;
import com.example.Project2_Spring.entity.UserInfo;
import com.example.Project2_Spring.repository.ReviewRepository;
import com.example.Project2_Spring.repository.ReviewReportRepository;
import com.example.Project2_Spring.repository.UserInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewReportService {

    private final ReviewReportRepository reviewReportRepository;
    private final ReviewRepository       reviewRepository;
    private final UserInfoRepository     userInfoRepository;

    // ── 신고 접수
    @Transactional
    public void report(Integer reviewIdx, String userId, String reportType, String customContent) {
        Review review = reviewRepository.findById(reviewIdx)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 리뷰입니다."));

        UserInfo reporter = userInfoRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 중복 신고 방지
        reviewReportRepository.findByReviewIdxAndReporterUserId(reviewIdx, userId)
                .ifPresent(r -> { throw new IllegalStateException("이미 신고한 리뷰입니다."); });

        // ETC 가 아닌데 customContent 가 있으면 무시
        String content = "ETC".equals(reportType) ? customContent : null;

        ReviewReport rr = new ReviewReport();
        rr.setReview(review);
        rr.setReporter(reporter);
        rr.setReportType(reportType);
        rr.setCustomContent(content);

        reviewReportRepository.save(rr);
    }

    // ── 백오피스 신고 목록 (전체, 최신순)
    @Transactional(readOnly = true)
    public List<BackofficeReviewReportItemDto> getAdminList() {
        return reviewReportRepository.findAllByOrderByRegDateDesc()
                .stream()
                .map(rr -> new BackofficeReviewReportItemDto(
                        rr.getIdx(),
                        rr.getReview().getIdx(),
                        rr.getReview().getContent(),
                        rr.getReview().getRestaurantEntity().getName(),
                        rr.getReporter().getNickname(),
                        rr.getReportType(),
                        rr.getCustomContent(),
                        rr.getState(),
                        rr.getRegDate()
                ))
                .collect(Collectors.toList());
    }

    // ── 신고 처리 상태 변경 (0=대기중, 1=처리완료, 2=기각)
    @Transactional
    public ReviewReport updateState(Integer reportIdx, Integer newState) {
        ReviewReport rr = reviewReportRepository.findById(reportIdx)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 신고입니다."));
        rr.setState(newState);
        return reviewReportRepository.save(rr);
    }
}
