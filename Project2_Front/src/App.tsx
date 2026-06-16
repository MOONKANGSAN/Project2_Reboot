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
import RestaurantDetailPage from "@/pages/RestaurantDetailPage";
import ReviewWritePage from "@/pages/ReviewWritePage";
import ReviewListPage from "@/pages/ReviewListPage";
import LikedPage from "@/pages/LikedPage";
import CustomerServicePage from "@/pages/CustomerServicePage";
import InquiryWritePage from "@/pages/InquiryWritePage";
import SignupPage from "@/pages/SignupPage";
import NotFoundPage from "@/pages/NotFoundPage";
import BackofficeSignup from "@/pages/backoffice/signup/index";
import BackofficeLogin from "@/pages/backoffice/login/index";
import BackofficeMain from "@/pages/backoffice/main/index";
import BackofficeRestaurantRegister from "@/pages/backoffice/restaurant/register/index";
import BackofficeRestaurantList from "@/pages/backoffice/restaurant/list/index";
import BackofficeRestaurantEdit from "@/pages/backoffice/restaurant/edit/index";
import BackofficeHashtagList from "@/pages/backoffice/restaurant/hashtag/index";
import BackofficeUserList from "@/pages/backoffice/user/list/index";
import BackofficeReviewList from "@/pages/backoffice/review/list/index";
import BackofficeReviewReport from "@/pages/backoffice/review/report/index";
import BackofficeNotice from "@/pages/backoffice/support/notice/index";
import BackofficeErrorLog from "@/pages/backoffice/support/error-log/index";
import BackofficeInquiry from "@/pages/backoffice/support/inquiry/index";
import PublicLayout from "@/layouts/PublicLayout";
import BackofficeLayout from "@/layouts/BackofficeLayout";
import BackofficeProtectedRoute from "@/layouts/BackofficeProtectedRoute";

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

        {/* 점포 상세 뷰 페이지 */}
        <Route path="/restaurants/:idx" element={<RestaurantDetailPage />} />

        {/* 리뷰 목록 페이지 */}
        <Route path="/reviews" element={<ReviewListPage />} />

        {/* 리뷰 작성 페이지 */}
        <Route path="/reviews/write" element={<ReviewWritePage />} />

        {/* 좋아요 기록 페이지 */}
        <Route path="/liked" element={<LikedPage />} />

        {/* 고객센터 */}
        <Route path="/inquiry"       element={<CustomerServicePage />} />
        <Route path="/inquiry/write" element={<InquiryWritePage />} />

        {/* 회원가입 페이지 */}
        <Route path="/signup" element={<SignupPage />} />

        {/* 404 페이지 - 존재하지 않는 경로 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Backoffice는 고객용 레이아웃과 분리 */}
      <Route path="/backoffice" element={<BackofficeLayout />}>
        {/* 비인증 공개 라우트 */}
        <Route index element={<BackofficeLogin />} />
        <Route path="login" element={<BackofficeLogin />} />
        <Route path="signup" element={<BackofficeSignup />} />

        {/* 인증 필요 라우트: 세션 없으면 /backoffice/login 으로 리다이렉트 */}
        <Route element={<BackofficeProtectedRoute />}>
          <Route path="main" element={<BackofficeMain />} />
          <Route path="restaurant/register" element={<BackofficeRestaurantRegister />} />
          <Route path="restaurant/list" element={<BackofficeRestaurantList />} />
          <Route path="restaurant/edit/:idx" element={<BackofficeRestaurantEdit />} />
          <Route path="restaurant/hashtag" element={<BackofficeHashtagList />} />
          <Route path="user/list" element={<BackofficeUserList />} />
          <Route path="review/list" element={<BackofficeReviewList />} />
          <Route path="review/report" element={<BackofficeReviewReport />} />
          <Route path="support/notice" element={<BackofficeNotice />} />
          <Route path="support/error-log" element={<BackofficeErrorLog />} />
          <Route path="support/inquiry" element={<BackofficeInquiry />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;