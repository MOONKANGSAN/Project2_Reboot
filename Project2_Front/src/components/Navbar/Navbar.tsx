import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { NavTab } from "@/types";
import "./Navbar.css";

// ── 탭 메뉴 정의
const NAV_TABS: NavTab[] = [
  { id: "home",        path: "/",            label: "홈" },
  { id: "restaurants", path: "/restaurants", label: "맛집 리스트" },
  { id: "liked",       path: "/liked",       label: "리뷰 보기" },
];

const MOCK_USER = { nickname: "먹킹부산", avatar: "먹" };

// ── SVG 아이콘 모음
function SearchIcon(): JSX.Element {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CloseIcon(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ── 유저 드롭다운
interface UserMenuProps { onLogout: () => void; onMyProfile: () => void; }

function UserMenu({ onLogout, onMyProfile }: UserMenuProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="navbar__user-menu" ref={menuRef}>
      <button
        className="navbar__user-avatar"
        onClick={() => setOpen(p => !p)}
        aria-label="유저 메뉴"
        aria-expanded={open}
      >
        <span className="navbar__avatar-circle">{MOCK_USER.avatar}</span>
        <span className="navbar__avatar-name">{MOCK_USER.nickname}</span>
        <svg
          className={`navbar__avatar-caret ${open ? "navbar__avatar-caret--open" : ""}`}
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="navbar__dropdown">
          <div className="navbar__dropdown-header">
            <span className="navbar__dropdown-avatar">{MOCK_USER.avatar}</span>
            <div>
              <p className="navbar__dropdown-name">{MOCK_USER.nickname}</p>
              <p className="navbar__dropdown-sub">맛집 탐험가</p>
            </div>
          </div>
          <div className="navbar__dropdown-divider" />
          <button className="navbar__dropdown-item" onClick={() => { onMyProfile(); setOpen(false); }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            내 프로필
          </button>
          <button className="navbar__dropdown-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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
          <button className="navbar__dropdown-item navbar__dropdown-item--logout"
            onClick={() => { onLogout(); setOpen(false); }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}

// ── 메인 컴포넌트
function Navbar(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen]     = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 스크롤 감지
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // ESC 키로 검색창 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchOpen) closeSearch();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [searchOpen]);

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 60);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  const getActiveTabId = () => {
    const p = location.pathname;
    if (p === "/") return "home";
    if (p === "/restaurants") return "restaurants";
    if (p === "/liked") return "liked";
    return "";
  };

  const handleTabClick = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  const activeTabId = getActiveTabId();

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__inner container">

        {/* 로고 */}
        <button className="navbar__logo" onClick={() => navigate("/")}>
          <span className="navbar__logo-icon">🍽</span>
          <span className="navbar__logo-text">맛지도</span>
        </button>

        {/* 가운데 영역: 탭 ↔ 검색창 전환 */}
        <div className="navbar__center">
          {/* 탭 메뉴 */}
          <nav className={`navbar__tabs ${searchOpen ? "navbar__tabs--hidden" : ""}`}>
            {NAV_TABS.map((tab: NavTab) => (
              <button
                key={tab.id}
                className={`navbar__tab ${activeTabId === tab.id ? "navbar__tab--active" : ""}`}
                onClick={() => handleTabClick(tab.path)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* 검색 입력창 */}
          <div className={`navbar__search-bar ${searchOpen ? "navbar__search-bar--open" : ""}`}>
            <span className="navbar__search-bar-icon"><SearchIcon /></span>
            <input
              ref={searchInputRef}
              className="navbar__search-input"
              type="text"
              placeholder="맛집 이름, 카테고리, 지역 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { /* 검색 실행 */ } }}
            />
            <button
              className="navbar__search-close"
              onClick={closeSearch}
              aria-label="검색 닫기"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* 우측 액션 영역 */}
        <div className="navbar__actions">

          {/* 검색 토글 버튼 */}
          <button
            className={`navbar__icon-btn ${searchOpen ? "navbar__icon-btn--active" : ""}`}
            onClick={searchOpen ? closeSearch : openSearch}
            aria-label={searchOpen ? "검색 닫기" : "검색"}
          >
            {searchOpen ? <CloseIcon /> : <SearchIcon />}
          </button>

          {/* 로그인 상태 분기 */}
          {isLoggedIn ? (
            <>
              <button className="navbar__review-btn btn-primary">+ 리뷰 쓰기</button>
              <UserMenu onLogout={() => setIsLoggedIn(false)} onMyProfile={() => alert("준비 중")} />
            </>
          ) : (
            <div className="navbar__auth-btns">
              {/* 로그인 - 텍스트 링크형 */}
              <button className="navbar__login-btn" onClick={() => setIsLoggedIn(true)}>
                로그인
              </button>
              {/* 회원가입 - 컴팩트 filled 버튼 */}
              <button className="navbar__signup-btn" onClick={() => navigate("/signup")}>
                회원가입
              </button>
            </div>
          )}

          {/* 모바일 햄버거 버튼 */}
          <button
            className={`navbar__hamburger ${menuOpen ? "navbar__hamburger--open" : ""}`}
            onClick={() => setMenuOpen(p => !p)}
            aria-label="메뉴 열기"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 */}
      <div className={`navbar__mobile-menu ${menuOpen ? "navbar__mobile-menu--open" : ""}`}>
        {NAV_TABS.map((tab: NavTab) => (
          <button
            key={tab.id}
            className={`navbar__mobile-tab ${activeTabId === tab.id ? "navbar__mobile-tab--active" : ""}`}
            onClick={() => handleTabClick(tab.path)}
          >
            {tab.label}
          </button>
        ))}
        {!isLoggedIn && (
          <div className="navbar__mobile-auth">
            <button className="navbar__mobile-login" onClick={() => setIsLoggedIn(true)}>로그인</button>
            <button className="navbar__mobile-signup" onClick={() => navigate("/signup")}>회원가입</button>
          </div>
        )}
        {isLoggedIn && (
          <button className="navbar__mobile-tab navbar__mobile-logout"
            onClick={() => setIsLoggedIn(false)}>
            로그아웃
          </button>
        )}
      </div>
    </header>
  );
}

export default Navbar;
