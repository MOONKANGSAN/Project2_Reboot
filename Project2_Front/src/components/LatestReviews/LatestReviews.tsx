// 📁 src/components/LatestReviews/LatestReviews.tsx
// 역할: 메인 페이지의 "최신 리뷰" 섹션 컴포넌트
//       가장 최근 작성된 리뷰 카드를 가로 스크롤 형태로 표시
//       ReviewCardProps 타입으로 review 데이터 구조를 컴파일 타임에 검증
//       추후 Spring API: GET /api/reviews/latest?limit=4 로 교체 예정

import { MOCK_LATEST_REVIEWS } from "@/data/mockData";
import type { Review, ReviewCardProps } from "@/types";
import "./LatestReviews.css";

// 별점을 별 문자열로 변환하는 유틸 함수
// rating: number (1~5) → 예: 4 → "★★★★☆"
const renderStars = (rating: number): string => {
  return Array.from({ length: 5 }, (_: unknown, i: number) =>
    i < rating ? "★" : "☆"
  ).join("");
};

// 날짜 문자열을 한국어 형식으로 변환하는 유틸 함수
// dateStr: ISO 형식 "YYYY-MM-DD" → 예: "2025-04-18" → "4월 18일"
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

// 개별 리뷰 카드 컴포넌트 - ReviewCardProps 타입으로 props 구조를 명시
function ReviewCard({ review }: ReviewCardProps): JSX.Element {
  return (
    <article className="review-card">
      {/* 리뷰 이미지 썸네일 - imageUrl이 있을 때만 렌더링 */}
      {review.imageUrl && (
        <div className="review-card__image">
          <img src={review.imageUrl} alt={review.restaurantName} />
        </div>
      )}

      <div className="review-card__body">
        {/* 리뷰 작성자 정보 + 날짜 */}
        <div className="review-card__meta">
          {/* 사용자 아바타 (이니셜) - 추후 프로필 이미지로 교체 예정 */}
          <div className="review-card__avatar">{review.userAvatar}</div>
          <div className="review-card__user-info">
            <span className="review-card__username">{review.userNickname}</span>
            <span className="review-card__date">{formatDate(review.createdAt)}</span>
          </div>
        </div>

        {/* 리뷰 대상 식당 정보 */}
        <div className="review-card__restaurant">
          <span className="badge">{review.restaurantCategory}</span>
          <span className="review-card__restaurant-name">{review.restaurantName}</span>
        </div>

        {/* 별점 표시 */}
        <div className="star-rating review-card__rating">
          {renderStars(review.rating)}
          <span className="review-card__rating-num">{review.rating}.0</span>
        </div>

        {/* 리뷰 본문 - 3줄까지만 표시 (CSS line-clamp) */}
        <p className="review-card__content">{review.content}</p>

        {/* 좋아요 카운트 */}
        <div className="review-card__footer">
          <button className="review-card__like-btn">
            <span>♥</span>
            <span>{review.likeCount}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function LatestReviews(): JSX.Element {
  return (
    <section className="section latest-reviews">
      <div className="container">
        {/* 섹션 헤더 */}
        <div className="section-header latest-reviews__header">
          <h2 className="section-title">최신 리뷰</h2>
          <p className="section-subtitle">방금 올라온 따끈따끈한 맛집 후기</p>
          {/* 전체 보기 버튼 - 추후 리뷰 목록 페이지로 연결 예정 */}
          <button className="btn-outline latest-reviews__more-btn">
            전체 보기 →
          </button>
        </div>

        {/* 리뷰 카드 가로 스크롤 목록 */}
        <div className="latest-reviews__list">
          {MOCK_LATEST_REVIEWS.map((review: Review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default LatestReviews;