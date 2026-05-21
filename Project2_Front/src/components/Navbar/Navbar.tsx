// 📁 src/components/Navbar/Navbar.tsx
// 역할: 상단 고정 네비게이션 바 컴포넌트
//       로고, 라우터 기반 네비게이션, 검색, 로그인/회원가입, 로그인 후 유저 드롭다운 포함
//       URL 경로에 따라 활성 탭이 자동으로 표시됨 (React Router useLocation 사용)
//       isLoggedIn 상태에 따라 우측 버튼 영역이 두 가지 모드로 전환됨
//       추후 JWT 토큰 기반 인증 상태를 Context 또는 전역 상태(Zustand 등)로 관리 예정

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { NavTab } from "@/types";
import "./Navbar.css";

// ─────────────────────────────────────────
// 상수 데이터
// ─────────────────────────────────────────

// 라우터 기반 탭 메뉴 정의
// id: 탭 고유 식별자
// path: 라우터 경로
// label: 사용자에게 표시될 텍스트
const NAV_TABS: NavTab[] = [
  { id: "home",        path: "/",            label: "홈"       },
  { id: "restaurants", path: "/restaurants", label: "맛집 탐색" },
  { id: "liked",       path: "/liked",       label: "좋아요 기록" },
];

// 로그인한 유저 목업 데이터 - 추후 API 응답 / Context로 교체 예정
const MOCK_USER = {
  nickname: "먹킹부산",
  avatar: "먹",           // 이니셜 (추후 프로필 이미지 URL로 교체)
};

// ─────────────────────────────────────────
// 서브 컴포넌트: 비로그인 상태 버튼 영역
// ─────────────────────────────────────────
interface GuestActionsProps {
  onLogin: () => void;
  onSignup: () => void;
}

function GuestActions({ onLogin, onSignup }: GuestActionsProps): JSX.Element {
  return (
    // 로그인 + 회원가입 버튼 묶음
    <div className="navbar__auth-btns">
      {/* 로그인 버튼 - 아웃라인 스타일 */}
      <button className="navbar__login-btn" onClick={onLogin}>
        로그인
      </button>
      {/* 회원가입 버튼 - 강조 스타일 */}
      <button className="navbar__signup-btn" onClick={onSignup}>
        회원가입
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// 서브 컴포넌트: 로그인 상태 유저 드롭다운
// ─────────────────────────────────────────
interface UserMenuProps {
  onLogout: () => void;
  onMyProfile: () => void;
}

function UserMenu({ onLogout, onMyProfile }: UserMenuProps): JSX.Element {
  // 드롭다운 열림/닫힘 상태
  const [open, setOpen] = useState<boolean>(false);
  // 드롭다운 외부 클릭 감지를 위한 ref
  const menuRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 시 자동 닫힘 처리
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="navbar__user-menu" ref={menuRef}>
      {/* 아바타 버튼 - 클릭 시 드롭다운 토글 */}
      <button
        className="navbar__user-avatar"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="유저 메뉴"
        aria-expanded={open}
      >
        {/* 이니셜 아바타 원형 */}
        <span className="navbar__avatar-circle">{MOCK_USER.avatar}</span>
        <span className="navbar__avatar-name">{MOCK_USER.nickname}</span>
        {/* 드롭다운 화살표 아이콘 */}
        <svg
          className={`navbar__avatar-caret ${open ? "navbar__avatar-caret--open" : ""}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* 드롭다운 메뉴 패널 */}
      {open && (
        <div className="navbar__dropdown">
          {/* 유저 정보 헤더 */}
          <div className="navbar__dropdown-header">
            <span className="navbar__dropdown-avatar">{MOCK_USER.avatar}</span>
            <div>
              <p className="navbar__dropdown-name">{MOCK_USER.nickname}</p>
              <p className="navbar__dropdown-sub">맛집 탐험가</p>
            </div>
          </div>

          <div className="navbar__dropdown-divider" />

          {/* 드롭다운 메뉴 항목 */}
          <button 
            className="navbar__dropdown-item"
            onClick={() => {
              onMyProfile();
              setOpen(false);
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            내 프로필
          </button>
          <button className="navbar__dropdown-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            내 리뷰 관리
          </button>
          <button className="navbar__dropdown-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            좋아요 기록
          </button>

          <div className="navbar__dropdown-divider" />

          {/* 로그아웃 버튼 */}
          <button
            className="navbar__dropdown-item navbar__dropdown-item--logout"
            onClick={() => {
              onLogout();
              setOpen(false);
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// 메인 컴포넌트: Navbar
// ─────────────────────────────────────────

// 라우터 기반 Navbar - Props가 필요 없음
function Navbar(): JSX.Element {
  // React Router 훅
  const navigate = useNavigate();
  const location = useLocation();

  // 모바일 메뉴 열림/닫힘 상태
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  // 스크롤 시 네브바 스타일 변경 여부
  const [scrolled, setScrolled] = useState<boolean>(false);
  // 로그인 상태 - 추후 AuthContext 또는 전역 상태로 교체 예정
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // 스크롤 이벤트 감지
  useEffect(() => {
    const handleScroll = (): void => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 현재 경로에서 활성 탭 ID 반환
  // location.pathname을 기반으로 어떤 탭이 활성화되어야 하는지 판단
  const getActiveTabId = (): string => {
    const path = location.pathname;
    
    if (path === "/") return "home";
    if (path === "/restaurants") return "restaurants";
    if (path === "/liked") return "liked";
    
    // 매칭되는 경로가 없으면 빈 문자열 반환
    return "";
  };

  // 탭 클릭 핸들러 - 해당 경로로 네비게이트
  const handleTabClick = (path: string): void => {
    navigate(path);
    setMenuOpen(false);
  };

  // 로고 클릭 핸들러 - 홈으로 이동
  const handleLogoClick = (): void => {
    navigate("/");
  };

  // 로그인 핸들러 - 추후 로그인 모달 또는 /login 라우팅으로 교체
  const handleLogin = (): void => {
    setIsLoggedIn(true); // 임시: 목업 로그인 처리
  };

  // 회원가입 핸들러 - /signup 경로로 이동
  const handleSignup = (): void => {
    navigate("/signup");
  };

  // 로그아웃 핸들러 - 추후 토큰 삭제 및 상태 초기화 처리로 교체
  const handleLogout = (): void => {
    setIsLoggedIn(false);
  };

  // 프로필 클릭 핸들러 - 추후 /profile 경로 추가
  const handleMyProfile = (): void => {
    // navigate("/profile"); // 추후 구현
    alert("프로필 페이지 (준비 중)");
  };

  // 활성 탭 ID
  const activeTabId = getActiveTabId();

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__inner container">

        {/* 로고 */}
        <button className="navbar__logo" onClick={handleLogoClick}>
          <span className="navbar__logo-icon">🍽</span>
          <span className="navbar__logo-text">맛지도</span>
        </button>

        {/* 데스크톱 탭 메뉴 - 라우터 기반 네비게이션 */}
        <nav className="navbar__tabs">
          {NAV_TABS.map((tab: NavTab) => (
            <button
              key={tab.id}
              // 현재 경로와 탭의 path가 일치하면 활성 클래스 적용
              className={`navbar__tab ${activeTabId === tab.id ? "navbar__tab--active" : ""}`}
              onClick={() => handleTabClick(tab.path)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* 우측 액션 영역 */}
        <div className="navbar__actions">

          {/* 검색 아이콘 - 항상 표시 */}
          <button className="navbar__icon-btn" aria-label="검색">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* ── 로그인 상태 분기 렌더링 ──
              비로그인: 로그인 + 회원가입 버튼
              로그인:   리뷰쓰기 버튼 + 유저 드롭다운 */}
          {isLoggedIn ? (
            <>
              {/* 로그인 후에만 표시되는 리뷰 쓰기 버튼 */}
              <button className="navbar__review-btn btn-primary">
                + 리뷰 쓰기
              </button>
              {/* 유저 아바타 + 드롭다운 메뉴 */}
              <UserMenu onLogout={handleLogout} onMyProfile={handleMyProfile} />
            </>
          ) : (
            /* 비로그인 상태: 로그인 + 회원가입 버튼 */
            <GuestActions onLogin={handleLogin} onSignup={handleSignup} />
          )}

          {/* 모바일 햄버거 버튼 */}
          <button
            className={`navbar__hamburger ${menuOpen ? "navbar__hamburger--open" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="메뉴 열기"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 - 라우터 기반 네비게이션 */}
      <div className={`navbar__mobile-menu ${menuOpen ? "navbar__mobile-menu--open" : ""}`}>
        {NAV_TABS.map((tab: NavTab) => (
          <button
            key={tab.id}
            // 현재 경로와 탭의 path가 일치하면 활성 클래스 적용
            className={`navbar__mobile-tab ${activeTabId === tab.id ? "navbar__mobile-tab--active" : ""}`}
            onClick={() => handleTabClick(tab.path)}
          >
            {tab.label}
          </button>
        ))}

        {/* 모바일 메뉴 하단 로그인/회원가입 버튼 */}
        {!isLoggedIn && (
          <div className="navbar__mobile-auth">
            <button className="navbar__mobile-login" onClick={handleLogin}>로그인</button>
            <button className="navbar__mobile-signup" onClick={handleSignup}>회원가입</button>
          </div>
        )}

        {/* 모바일 로그인 후 로그아웃 버튼 */}
        {isLoggedIn && (
          <button
            className="navbar__mobile-tab navbar__mobile-logout"
            onClick={handleLogout}
          >
            로그아웃
          </button>
        )}
      </div>
    </header>
  );
}

export default Navbar;