package com.example.Project2_Spring.service;

import com.example.Project2_Spring.entity.Review;
import com.example.Project2_Spring.entity.ReviewLike;
import com.example.Project2_Spring.entity.UserInfo;
import com.example.Project2_Spring.repository.ReviewLikeRepository;
import com.example.Project2_Spring.repository.ReviewRepository;
import com.example.Project2_Spring.repository.UserInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReviewLikeService {

    private final ReviewLikeRepository reviewLikeRepository;
    private final ReviewRepository     reviewRepository;
    private final UserInfoRepository   userInfoRepository;

    // ── 좋아요 토글
    // 반환: 토글 후의 state(0 or 1)와 최신 likeCount
    @Transactional
    public int[] toggle(Integer reviewIdx, String userId) {
        Review review = reviewRepository.findById(reviewIdx)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 리뷰입니다."));

        UserInfo user = userInfoRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        Optional<ReviewLike> existing = reviewLikeRepository
                .findByReviewIdxAndUserId(reviewIdx, userId);

        int newState;

        if (existing.isEmpty()) {
            // 첫 좋아요: 레코드 생성 (state=1)
            ReviewLike like = new ReviewLike();
            like.setReview(review);
            like.setUser(user);
            like.setState(1);
            reviewLikeRepository.save(like);
            newState = 1;

        } else {
            ReviewLike like = existing.get();
            if (like.getState() == 1) {
                // 좋아요 해제: state → 0
                like.setState(0);
                newState = 0;
            } else {
                // 다시 좋아요: state → 1
                like.setState(1);
                newState = 1;
            }
            reviewLikeRepository.save(like);
        }

        // review.like_count 동기화 (0 미만 방지)
        int updatedCount = Math.max(0, review.getLikeCount() + (newState == 1 ? 1 : -1));
        review.setLikeCount(updatedCount);
        reviewRepository.save(review);

        return new int[]{ newState, updatedCount };
    }

    // ── 특정 유저가 좋아요(state=1)한 리뷰 idx 목록
    @Transactional(readOnly = true)
    public List<Integer> getMyLikedReviewIdxList(String userId) {
        return reviewLikeRepository.findLikedReviewIdxByUserId(userId);
    }
}
