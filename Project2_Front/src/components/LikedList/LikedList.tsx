// 📁 src/components/LikedList/LikedList.tsx
// 역할: 사용자가 좋아요를 누른 맛집 목록 페이지 컴포넌트
//       Set<number> 타입으로 removedIds를 관리하여 number 외 값 삽입 방지
//       현재는 mockData에서 isLiked=true인 데이터를 사용
//       추후 Spring API: GET /api/users/{userId}/likes + JWT 인증 연동 예정

import { useState } from "react";
import { MOCK_LIKED_RESTAURANTS } from "@/data/mockData";
import type { Restaurant } from "@/types";
import "./LikedList.css";

// 별점 표시 유틸 함수
// rating: number → 정수 별점 기준 5자리 별 문자열 반환
const renderStars = (rating: number): string => {
  return Array.from({ length: 5 }, (_: unknown, i: number) =>
    i < Math.floor(rating) ? "★" : "☆"
  ).join("");
};

function LikedList(): JSX.Element {
  // 좋아요 취소된 맛집 ID 집합 - Set<number> 타입으로 명시
  // 추후 API 호출(DELETE /api/users/{id}/likes/{restaurantId})로 교체 예정
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());

  // 좋아요 취소 핸들러 - id: number 타입으로 문자열 등 잘못된 값 방지
  const handleUnlike = (id: number): void => {
    setRemovedIds((prev: Set<number>) => new Set([...prev, id]));
  };

  // 취소된 항목을 제외한 목록 - Restaurant[] 타입으로 명시
  const likedList: Restaurant[] = MOCK_LIKED_RESTAURANTS.filter(
    (r: Restaurant) => !removedIds.has(r.id)
  );

  return (
    <section className="section liked-list">
      <div className="container">
        {/* 섹션 헤더 */}
        <div className="section-header">
          <h2 className="section-title">좋아요 기록</h2>
          <p className="section-subtitle">
            내가 즐겨찾기한 맛집 {likedList.length}곳
          </p>
        </div>

        {/* 빈 상태 처리 - 좋아요한 맛집이 없을 때 */}
        {likedList.length === 0 ? (
          <div className="liked-list__empty">
            <div className="liked-list__empty-icon">♡</div>
            <p className="liked-list__empty-title">아직 좋아요한 맛집이 없어요</p>
            <p className="liked-list__empty-desc">
              마음에 드는 맛집에 ♥를 눌러 저장해보세요
            </p>
          </div>
        ) : (
          /* 좋아요 맛집 목록 */
          <div className="liked-list__grid">
            {likedList.map((restaurant: Restaurant) => (
              <div key={restaurant.id} className="liked-card">
                {/* 식당 이미지 */}
                <div className="liked-card__image-wrap">
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="liked-card__image"
                  />
                </div>

                {/* 식당 정보 */}
                <div className="liked-card__info">
                  <div className="liked-card__header">
                    <span className="badge">{restaurant.category}</span>
                    <span className="liked-card__price">{restaurant.priceRange}</span>
                  </div>
                  <h3 className="liked-card__name">{restaurant.name}</h3>

                  <div className="liked-card__rating">
                    <span className="star-rating">{renderStars(restaurant.rating)}</span>
                    <span className="liked-card__rating-num">{restaurant.rating}</span>
                    <span className="liked-card__review-count">({restaurant.reviewCount})</span>
                  </div>

                  <div className="liked-card__location">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    {restaurant.location} · {restaurant.distance}
                  </div>
                </div>

                {/* 좋아요 취소 버튼 */}
                <button
                  className="liked-card__unlike-btn"
                  onClick={() => handleUnlike(restaurant.id)}
                  aria-label="좋아요 취소"
                >
                  <span>♥</span>
                  <span>저장 취소</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default LikedList;