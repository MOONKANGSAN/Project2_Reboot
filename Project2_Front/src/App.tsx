// 📁 src/App.tsx
// 역할: 앱 전체의 최상위 컴포넌트. 라우팅 및 전역 레이아웃을 담당
//       TabId 타입으로 허용되지 않는 탭 값 사용을 컴파일 타임에 차단
//       추후 React Router를 사용해 페이지 전환을 관리할 예정

import { useState } from "react";
import Navbar from "@/components/Navbar/Navbar";
import MainBanner from "@/components/MainBanner/MainBanner";
import LatestReviews from "@/components/LatestReviews/LatestReviews";
import RestaurantList from "@/components/RestaurantList/RestaurantList";
import LikedList from "@/components/LikedList/LikedList";
import Footer from "@/components/Footer/Footer";
import type { TabId } from "./types";
import "./styles/global.css";

function App(): JSX.Element {
  // 현재 활성화된 탭 메뉴를 추적하는 상태 - TabId 타입으로 허용 값을 제한
  const [activeTab, setActiveTab] = useState<TabId>("home");

  // 탭에 따라 렌더링할 컨텐츠를 결정하는 함수
  // JSX.Element | null 반환 타입으로 렌더링 결과를 명시
  const renderContent = (): JSX.Element | null => {
    switch (activeTab) {
      case "home":
        return (
          <>
            {/* 메인 배너 섹션 */}
            <MainBanner />
            {/* 최신 리뷰 섹션 */}
            <LatestReviews />
            {/* 맛집 리스트 섹션 */}
            <RestaurantList />
          </>
        );
      case "restaurants":
        return <RestaurantList showAll />;
      case "liked":
        return <LikedList />;
      default:
        return null;
    }
  };

  return (
    <div className="app-wrapper">
      {/* 상단 고정 내비게이션 바 */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 메인 컨텐츠 영역 */}
      <main className="main-content">{renderContent()}</main>

      {/* 하단 푸터 */}
      <Footer />
    </div>
  );
}

export default App;