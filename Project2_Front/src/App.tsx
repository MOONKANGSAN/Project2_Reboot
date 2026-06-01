// 📁 src/App.tsx
// 역할: 앱 전체의 최상위 컴포넌트
//       React Router를 사용하여 라우팅을 관리
//       Navbar와 Footer는 모든 페이지에서 고정으로 표시
//       URL 경로에 따라 다른 컴포넌트가 main 영역에 렌더링됨
//       각 Route에 대응하는 Page 컴포넌트로 분리되어 있음

import { Routes, Route } from "react-router-dom";

// 페이지 컴포넌트 임포트
import HomePage from "@/pages/Home";
import RestaurantsPage from "@/pages/RestaurantsPage";
import LikedPage from "@/pages/LikedPage";
import SignupPage from "@/pages/SignupPage";
import NotFoundPage from "@/pages/NotFoundPage";
import BackofficeSignup from "@/pages/backoffice/signup/index";
import PublicLayout from "@/layouts/PublicLayout";
import BackofficeLayout from "@/layouts/BackofficeLayout";

// ─────────────────────────────────────────
// 메인 컴포넌트: App
// ─────────────────────────────────────────

function App(): JSX.Element {
  return (
    <Routes>
      {/* 고객용 페이지들은 PublicLayout(공통 Navbar/Footer) 하위에 배치 */}
      <Route element={<PublicLayout />}>
        {/* 홈 페이지: 배너 + 최신 리뷰 + 맛집 리스트 */}
        <Route path="/" element={<HomePage />} />

        {/* 전체 맛집 탐색 페이지 */}
        <Route path="/restaurants" element={<RestaurantsPage />} />

        {/* 좋아요 기록 페이지 */}
        <Route path="/liked" element={<LikedPage />} />

        {/* 회원가입 페이지 */}
        <Route path="/signup" element={<SignupPage />} />

        {/* 404 페이지 - 존재하지 않는 경로 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Backoffice는 고객용 레이아웃과 분리 */}
      <Route path="/backoffice" element={<BackofficeLayout />}>
        <Route index element={<BackofficeSignup />} />
        <Route path="signup" element={<BackofficeSignup />} />
      </Route>
    </Routes>
  );
}

export default App;