package com.example.Project2_Spring.repository;

import com.example.Project2_Spring.entity.ReviewLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Integer> {

    // 특정 리뷰 + 특정 유저의 좋아요 레코드 조회
    @Query("SELECT rl FROM ReviewLike rl WHERE rl.review.idx = :reviewIdx AND rl.user.userId = :userId")
    Optional<ReviewLike> findByReviewIdxAndUserId(
            @Param("reviewIdx") Integer reviewIdx,
            @Param("userId")    String userId);

    // 특정 유저가 좋아요(state=1) 상태인 리뷰 idx 목록 조회
    @Query("SELECT rl.review.idx FROM ReviewLike rl WHERE rl.user.userId = :userId AND rl.state = 1")
    List<Integer> findLikedReviewIdxByUserId(@Param("userId") String userId);
}
