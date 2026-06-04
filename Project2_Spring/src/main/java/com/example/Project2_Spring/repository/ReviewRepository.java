package com.example.Project2_Spring.repository;

import com.example.Project2_Spring.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {

    // 점포별 활성 리뷰의 평균 별점 조회 (스케줄러 전체 갱신 시 사용)
    @Modifying
    @Query(
        value = "UPDATE restaurant r " +
                "SET r.avg_rating = (" +
                "  SELECT AVG(rv.rating) " +
                "  FROM review rv " +
                "  WHERE rv.restaurant_idx = r.idx AND rv.state = 1" +
                ")",
        nativeQuery = true
    )
    void bulkUpdateAvgRating();
}
