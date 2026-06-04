package com.example.Project2_Spring.scheduler;

import com.example.Project2_Spring.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class RatingScheduler {

    private final ReviewRepository reviewRepository;

    /**
     * 매일 00:00 실행 — 전체 점포의 avg_rating을 활성 리뷰 평균으로 일괄 갱신
     * cron 표현식: 초 분 시 일 월 요일
     * 활성화: application.properties에서 schedule.rating.cron=0 0 0 * * *
     * 비활성화: schedule.rating.cron=-
     */
    @Scheduled(cron = "${schedule.rating.cron}")
    @Transactional
    public void updateAvgRatings() {
        log.info("[RatingScheduler] avg_rating 갱신 시작 — {}", LocalDateTime.now());
        try {
            reviewRepository.bulkUpdateAvgRating();
            log.info("[RatingScheduler] avg_rating 갱신 완료 — {}", LocalDateTime.now());
        } catch (Exception e) {
            log.error("[RatingScheduler] avg_rating 갱신 실패: {}", e.getMessage(), e);
        }
    }
}
