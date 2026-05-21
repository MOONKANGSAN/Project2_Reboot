// 📁 src/pages/RestaurantsPage.tsx
// 역할: 맛집 탐색 페이지 컴포넌트
//       전체 맛집 목록을 표시하는 페이지
//       "/restaurants" 경로에서 렌더링됨
//       RestaurantList 컴포넌트에 showAll={true}를 전달하여 전체 목록 표시

import RestaurantList from "@/components/RestaurantList/RestaurantList";

// ─────────────────────────────────────────
// 페이지 컴포넌트
// ─────────────────────────────────────────

function RestaurantsPage(): JSX.Element {
  return (
    // 전체 맛집 목록을 표시 (showAll={true})
    <RestaurantList showAll={true} />
  );
}

export default RestaurantsPage;