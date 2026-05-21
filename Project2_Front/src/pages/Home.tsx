// 📁 src/pages/HomePage.tsx
// 역할: 홈 페이지 컴포넌트
//       메인 배너, 최신 리뷰 섹션, 맛집 리스트 섹션을 조합한 페이지
//       "/" 경로에서 렌더링됨
//       각 섹션은 독립적인 컴포넌트로 분리되어 있음

import MainBanner from "@/components/MainBanner/MainBanner";
import LatestReviews from "@/components/LatestReviews/LatestReviews";
import RestaurantList from "@/components/RestaurantList/RestaurantList";

// ─────────────────────────────────────────
// 페이지 컴포넌트
// ─────────────────────────────────────────

function HomePage(): JSX.Element {
  return (
    <>
      {/* 상단 메인 배너 섹션 */}
      <MainBanner />

      {/* 최신 리뷰 섹션 */}
      <LatestReviews />

      {/* 맛집 리스트 섹션 (홈에서는 일부 아이템만 표시) */}
      <RestaurantList showAll={false} />
    </>
  );
}

export default HomePage;