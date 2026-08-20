import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import LoginModal from "@/components/LoginModal/LoginModal";
import "@/layouts/PublicLayout.css";

interface UserSession {
  userId: string;
  nickname: string;
  loginTime: string;
  profileImageUrl?: string;
}

function PublicLayout(): JSX.Element {
  const [isLoggedIn, setIsLoggedIn]       = useState(false);
  const [userSession, setUserSession]     = useState<UserSession | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // 새로고침 시 sessionStorage에서 세션 복원
  useEffect(() => {
    const raw = sessionStorage.getItem('userSession');
    if (raw) {
      const session: UserSession = JSON.parse(raw);
      setUserSession(session);
      setIsLoggedIn(true);
    }
  }, []);

  // ProfilePage 등에서 세션 갱신 시 Navbar 즉시 반영
  useEffect(() => {
    const handler = () => {
      const raw = sessionStorage.getItem('userSession');
      if (raw) setUserSession(JSON.parse(raw));
    };
    window.addEventListener('sessionUpdated', handler);
    return () => window.removeEventListener('sessionUpdated', handler);
  }, []);

  const handleLoginSuccess = (userId: string, nickname: string, profileImageUrl?: string): void => {
    const session: UserSession = {
      userId,
      nickname,
      loginTime: new Date().toISOString(),
      profileImageUrl,
    };
    sessionStorage.setItem('userSession', JSON.stringify(session));
    setUserSession(session);
    setIsLoggedIn(true);
  };

  const handleLogout = (): void => {
    sessionStorage.removeItem('userSession');
    setUserSession(null);
    setIsLoggedIn(false);
  };

  return (
    <div className="public-layout">
      <Navbar
        isLoggedIn={isLoggedIn}
        userNickname={userSession?.nickname}
        userProfileImageUrl={userSession?.profileImageUrl}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
      />
      <main className="public-main-content">
        <Outlet />
      </main>
      <Footer />

      {/* 로그인 모달: 레이아웃 최상단에서 렌더링해 전체 화면 오버레이 가능 */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default PublicLayout;
