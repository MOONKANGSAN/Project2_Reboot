// 📁 src/pages/LikedPage.tsx
// 역할: 좋아요 기록 페이지 컴포넌트
//       사용자가 좋아요 표시한 맛집 목록을 표시하는 페이지
//       "/liked" 경로에서 렌더링됨
//       LikedList 컴포넌트를 렌더링

import LikedList from "@/components/LikedList/LikedList";

// ─────────────────────────────────────────
// 페이지 컴포넌트
// ─────────────────────────────────────────

function LikedPage(): JSX.Element {
  return (
    // 좋아요한 맛집 목록을 표시
    <LikedList />
  );
}

export default LikedPage;