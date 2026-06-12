// 📁 src/components/MainBanner/MainBanner.tsx
// 역할: 메인 페이지 최상단 히어로 배너 컴포넌트
//       검색 기능 입력창, 배경 이미지, 주요 카테고리 바로가기 포함
//       이벤트 핸들러에 React.FormEvent / React.ChangeEvent 타입을 명시
//       추후 Spring API에서 인기 검색어, 배너 이미지 URL 등을 받아 동적으로 변경 예정

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CategoryItem, FoodCategory } from "../../types";
import "./MainBanner.css";

// 카테고리 바로가기 데이터 - CategoryItem[] 타입으로 구조 보장
// 추후 API에서 가져올 예정
const CATEGORIES: CategoryItem[] = [
  { id: "korean",   emoji: "🍲", label: "한식" },
  { id: "japanese", emoji: "🍱", label: "일식" },
  { id: "chinese",  emoji: "🥟", label: "중식" },
  { id: "western",  emoji: "🍝", label: "양식" },
  { id: "cafe",     emoji: "☕", label: "카페" },
  { id: "snack",    emoji: "🍢", label: "분식" },
];

function MainBanner(): JSX.Element {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 검색 제출 → 점포리스트로 이동하며 keyword 쿼리파라미터 전달
  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const keyword = searchQuery.trim();
    if (keyword) {
      navigate(`/restaurants?keyword=${encodeURIComponent(keyword)}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  // 카테고리 클릭 → 점포리스트로 이동하며 category 쿼리파라미터 전달
  const handleCategoryClick = (label: FoodCategory): void => {
    navigate(`/restaurants?category=${encodeURIComponent(label)}`);
  };

  return (
    <section className="main-banner">
      {/* 배경 그라디언트 오버레이 */}
      <div className="main-banner__overlay" />

      <div className="main-banner__content container">
        {/* 메인 타이틀 텍스트 */}
        <div className="main-banner__text">
          <h1 className="main-banner__title">
            오늘 뭐 먹지?
            <br />
            <span className="main-banner__title-accent">진짜 맛집</span>을 찾아드려요
          </h1>
          <p className="main-banner__desc">
            동네 맛집부터 숨겨진 맛집까지, 솔직한 리뷰로 찾아보세요
          </p>
        </div>

        {/* 검색 폼 */}
        <form className="main-banner__search" onSubmit={handleSearch}>
          <input
            type="text"
            className="main-banner__search-input"
            placeholder="맛집 이름, 메뉴, 지역으로 검색하세요"
            value={searchQuery}
            onChange={handleInputChange}
          />
          <button type="submit" className="main-banner__search-btn">
            {/* 검색 아이콘 SVG */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>검색</span>
          </button>
        </form>

        {/* 카테고리 바로가기 버튼 목록 */}
        <div className="main-banner__categories">
          {CATEGORIES.map((cat: CategoryItem) => (
            <button
              key={cat.id}
              className="main-banner__category-btn"
              onClick={() => handleCategoryClick(cat.label)}
            >
              <span className="main-banner__category-emoji">{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MainBanner;