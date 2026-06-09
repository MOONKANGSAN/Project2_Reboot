package com.example.Project2_Spring.repository;

import com.example.Project2_Spring.entity.ReviewReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewReportRepository extends JpaRepository<ReviewReport, Integer> {

    // 같은 유저가 같은 리뷰를 이미 신고했는지 확인
    @Query("SELECT rr FROM ReviewReport rr WHERE rr.review.idx = :reviewIdx AND rr.reporter.userId = :userId")
    Optional<ReviewReport> findByReviewIdxAndReporterUserId(
            @Param("reviewIdx") Integer reviewIdx,
            @Param("userId")    String userId);

    // 백오피스 신고 목록 (최신순)
    List<ReviewReport> findAllByOrderByRegDateDesc();
}
