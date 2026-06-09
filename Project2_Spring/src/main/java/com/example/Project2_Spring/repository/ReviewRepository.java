package com.example.Project2_Spring.repository;

import com.example.Project2_Spring.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {

    // 점포별 활성 리뷰의 평균 별점 일괄 갱신 (스케줄러용)
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

    // 점포 idx 목록에 대한 활성 리뷰 수 일괄 조회
    // 반환: [restaurant_idx, review_count] 쌍의 배열
    @Query("SELECT rv.restaurantEntity.idx, COUNT(rv) " +
           "FROM Review rv " +
           "WHERE rv.restaurantEntity.idx IN :idxList AND rv.state = 1 " +
           "GROUP BY rv.restaurantEntity.idx")
    List<Object[]> countActiveByRestaurantIdxIn(@Param("idxList") List<Integer> idxList);

    // 공개 리뷰 목록 조회 — 활성 리뷰만, 최신 등록순
    List<Review> findByStateOrderByRegDateDesc(Integer state);

    // 백오피스 리뷰 목록 — 전체(활성+비활성), 최신 등록순
    List<Review> findAllByOrderByRegDateDesc();

    // 특정 점포의 활성 리뷰 — 좋아요 많은순
    List<Review> findByRestaurantEntityIdxAndStateOrderByLikeCountDesc(
            Integer restaurantIdx, Integer state);
}
