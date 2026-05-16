// 📁 src/components/RestaurantList/RestaurantList.tsx
// 역할: 맛집 목록을 그리드 형태로 표시하는 컴포넌트
//       카테고리 필터, 정렬 기능 포함
//       SortKey 타입으로 허용되지 않는 정렬값 방지
//       showAll prop이 true이면 전체 목록 페이지로 동작
//       추후 Spring API: GET /api/restaurants?category=&sort=&page= 로 교체 예정

import React, { useState } from "react";
import { MOCK_RESTAURANTS } from "../../data/mockData";
import type {
  Restaurant,
  RestaurantCardProps,
  RestaurantListProps,
  FoodCategory,
  SortKey,
  SortOption,
} from "../../types";
import "./RestaurantList.css";

// 카테고리 필터 탭 옵션 - FoodCategory[] 타입으로 허용 값을 제한
const FILTER_OPTIONS: FoodCategory[] = [
  "전체", "한식", "일식", "양식", "카페", "분식",
];

// 정렬 옵션 - SortOption[] 타입으로 value가 SortKey인 것을 보장
// 추후 API 쿼리 파라미터 sort=rating 형태로 사용 예정
const SORT_OPTIONS: SortOption[] = [
  { value: "rating",      label: "별점순" },
  { value: "reviewCount", label: "리뷰 많은순" },
  { value: "distance",    label: "거리순" },
];

// 별점 표시 유틸 함수 - 반별(0.5) 포함 처리
// rating: number → 반별 포함 5자리 별 문자열 반환
const renderStars = (rating: number): string => {
  const full: number = Math.floor(rating);
  const half: boolean = rating - full >= 0.5;
  return Array.from({ length: 5 }, (_: unknown, i: number) => {
    if (i < full) return "★";
    if (i === full && half) return "✮";
    return "☆";
  }).join("");
};

// 개별 맛집 카드 컴포넌트 - RestaurantCardProps 타입으로 props 구조 보장
function RestaurantCard({ restaurant, onLikeToggle }: RestaurantCardProps): JSX.Element {
  // 좋아요 버튼 클릭 핸들러 - 이벤트 버블링 방지 후 상위로 id 전달
  const handleLikeClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    onLikeToggle(restaurant.id);
  };

  return (
    <article className="restaurant-card">
      {/* 카드 이미지 + 뱃지 오버레이 */}
      <div className="restaurant-card__image-wrap">
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className="restaurant-card__image"
        />

        {/* NEW 뱃지 - 신규 등록 맛집 */}
        {restaurant.isNew && (
          <span className="restaurant-card__badge restaurant-card__badge--new">NEW</span>
        )}

        {/* HOT 뱃지 - 인기 맛집 */}
        {restaurant.isTrending && (
          <span className="restaurant-card__badge restaurant-card__badge--hot">🔥 HOT</span>
        )}

        {/* 좋아요 버튼 - 추후 사용자 인증 후 API 연동 예정 */}
        <button
          className={`restaurant-card__like-btn ${
            restaurant.isLiked ? "restaurant-card__like-btn--active" : ""
          }`}
          onClick={handleLikeClick}
          aria-label={restaurant.isLiked ? "좋아요 취소" : "좋아요"}
        >
          {restaurant.isLiked ? "♥" : "♡"}
        </button>
      </div>

      {/* 카드 정보 영역 */}
      <div className="restaurant-card__info">
        {/* 카테고리 + 가격대 */}
        <div className="restaurant-card__tags">
          <span className="badge">{restaurant.category}</span>
          <span className="restaurant-card__price">{restaurant.priceRange}</span>
        </div>

        {/* 맛집 이름 */}
        <h3 className="restaurant-card__name">{restaurant.name}</h3>

        {/* 별점 + 리뷰 수 */}
        <div className="restaurant-card__rating-row">
          <span className="star-rating">{renderStars(restaurant.rating)}</span>
          <span className="restaurant-card__rating-num">{restaurant.rating}</span>
          <span className="restaurant-card__review-count">({restaurant.reviewCount})</span>
        </div>

        {/* 위치 + 거리 */}
        <div className="restaurant-card__location">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span>{restaurant.location}</span>
          <span className="restaurant-card__distance">· {restaurant.distance}</span>
        </div>

        {/* 태그 목록 */}
        <div className="restaurant-card__tag-list">
          {restaurant.tags.map((tag: string) => (
            <span key={tag} className="restaurant-card__tag">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

// RestaurantListProps의 showAll에 기본값 false 적용
function RestaurantList({ showAll = false }: RestaurantListProps): JSX.Element {
  // 선택된 카테고리 필터 상태 - FoodCategory 타입으로 허용 값을 제한
  const [activeFilter, setActiveFilter] = useState<FoodCategory>("전체");
  // 정렬 기준 상태 - SortKey 타입으로 허용 값을 제한
  const [sortBy, setSortBy] = useState<SortKey>("rating");
  // 좋아요 상태 (로컬 상태) - Set<number>로 타입 명시, 추후 API 호출로 교체 예정
  const [likedIds, setLikedIds] = useState<Set<number>>(
    new Set(MOCK_RESTAURANTS.filter((r: Restaurant) => r.isLiked).map((r: Restaurant) => r.id))
  );

  // 좋아요 토글 핸들러 - id: number 타입을 명시하여 문자열 등 잘못된 값 방지
  const handleLikeToggle = (id: number): void => {
    setLikedIds((prev: Set<number>) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 정렬 드롭다운 변경 핸들러
  // React.ChangeEvent<HTMLSelectElement> 타입으로 select 이벤트 전용임을 명시
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSortBy(e.target.value as SortKey); // select value는 string이므로 SortKey로 캐스팅
  };

  // 카테고리 필터 + 정렬 적용
  const filteredAndSorted: Restaurant[] = MOCK_RESTAURANTS
    .filter((r: Restaurant) =>
      activeFilter === "전체" || r.category === activeFilter
    )
    .sort((a: Restaurant, b: Restaurant) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "reviewCount") return b.reviewCount - a.reviewCount;
      // distance는 "0.3km" 문자열이므로 parseFloat으로 숫자 변환 후 비교
      if (sortBy === "distance") {
        return parseFloat(a.distance) - parseFloat(b.distance);
      }
      return 0;
    });

  // 메인 페이지에서는 최대 6개만 표시
  const displayList: Restaurant[] = showAll
    ? filteredAndSorted
    : filteredAndSorted.slice(0, 6);

  return (
    <section className="section restaurant-list">
      <div className="container">
        {/* 섹션 헤더 */}
        <div className="section-header">
          <h2 className="section-title">
            {showAll ? "맛집 탐색" : "주변 맛집"}
          </h2>
          <p className="section-subtitle">
            {showAll ? "다양한 맛집을 찾아보세요" : "오늘의 추천 맛집을 만나보세요"}
          </p>
        </div>

        {/* 필터 & 정렬 컨트롤 영역 */}
        <div className="restaurant-list__controls">
          {/* 카테고리 필터 탭 */}
          <div className="restaurant-list__filters">
            {FILTER_OPTIONS.map((filter: FoodCategory) => (
              <button
                key={filter}
                className={`restaurant-list__filter-btn ${
                  activeFilter === filter ? "restaurant-list__filter-btn--active" : ""
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* 정렬 선택 드롭다운 */}
          <select
            className="restaurant-list__sort"
            value={sortBy}
            onChange={handleSortChange}
          >
            {SORT_OPTIONS.map((opt: SortOption) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 맛집 카드 그리드 */}
        <div className="restaurant-list__grid">
          {displayList.map((restaurant: Restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={{ ...restaurant, isLiked: likedIds.has(restaurant.id) }}
              onLikeToggle={handleLikeToggle}
            />
          ))}
        </div>

        {/* 메인 페이지에서만 더보기 버튼 표시 */}
        {!showAll && (
          <div className="restaurant-list__more">
            <button className="btn-outline">맛집 더 보기</button>
          </div>
        )}
      </div>
    </section>
  );
}

export default RestaurantList;