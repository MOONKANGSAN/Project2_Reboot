import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import '@/layouts/backoffice/backoffice-tokens.css';

// ── 사이드바 섹션 타입 ──
type SectionKey = 'restaurant' | 'review' | 'user' | 'support';

interface NavItem {
  label: string;
  to: string;
  disabled?: boolean;
}

interface NavSection {
  key: SectionKey;
  label: string;
  items: NavItem[];
}

// ── 대분류 섹션 정의 ──
const NAV_SECTIONS: NavSection[] = [
  {
    key: 'restaurant',
    label: '점포 관리',
    items: [
      { label: '점포 목록', to: '/backoffice/restaurant/list' },
      { label: '점포 등록', to: '/backoffice/restaurant/register' },
      { label: '해시태그 목록', to: '/backoffice/restaurant/hashtag' },
    ],
  },
  {
    key: 'review',
    label: '리뷰 관리',
    items: [
      { label: '리뷰 목록', to: '/backoffice/review/list', disabled: true },
      { label: '신고 관리', to: '/backoffice/review/report', disabled: true },
    ],
  },
  {
    key: 'user',
    label: '유저 관리',
    items: [
      { label: '회원 목록', to: '/backoffice/user/list', disabled: true },
      { label: '탈퇴 관리', to: '/backoffice/user/leave', disabled: true },
    ],
  },
  {
    key: 'support',
    label: '서비스 지원',
    items: [
      { label: '에러 로그', to: '/backoffice/support/error-log', disabled: true },
      { label: '공지 관리', to: '/backoffice/support/notice', disabled: true },
    ],
  },
];

// 현재 경로에 해당하는 섹션 키 반환
function getSectionByPath(pathname: string): SectionKey | null {
  if (pathname.includes('/backoffice/restaurant')) return 'restaurant';
  if (pathname.includes('/backoffice/review')) return 'review';
  if (pathname.includes('/backoffice/user')) return 'user';
  if (pathname.includes('/backoffice/support')) return 'support';
  return null;
}

function BackofficeLayout(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!sessionStorage.getItem('backofficeSession');

  // 현재 경로에 해당하는 섹션을 초기값으로 열어둠
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(() => {
    const initial = getSectionByPath(location.pathname);
    return initial ? new Set([initial]) : new Set();
  });

  // 경로 이동 시 해당 섹션 자동 오픈
  useEffect(() => {
    const key = getSectionByPath(location.pathname);
    if (key) {
      setOpenSections((prev) => {
        if (prev.has(key)) return prev;
        return new Set([...prev, key]);
      });
    }
  }, [location.pathname]);

  const toggleSection = (key: SectionKey): void => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleLogout = (): void => {
    sessionStorage.removeItem('backofficeSession');
    navigate('/backoffice/login');
  };

  return (
    <div className="bo-root bo-layout">
      <header className="bo-topbar">
        <div className="bo-topbar__brand">BACKOFFICE</div>
      </header>

      <div className="bo-layout__body">
        <aside className="bo-sidebar" aria-label="백오피스 내비게이션">
          <nav className="bo-nav">

            {isLoggedIn ? (
              <>
                {/* 대시보드 */}
                <NavLink
                  to="/backoffice/main"
                  className={({ isActive }) => `bo-nav__item ${isActive ? 'is-active' : ''}`}
                >
                  대시보드
                </NavLink>

                <div className="bo-nav__divider" />

                {/* 대분류 섹션 (토글) */}
                {NAV_SECTIONS.map((section) => {
                  const isOpen = openSections.has(section.key);
                  return (
                    <div key={section.key} className="bo-nav__section">
                      <button
                        className={`bo-nav__section-header ${isOpen ? 'is-open' : ''}`}
                        onClick={() => toggleSection(section.key)}
                        aria-expanded={isOpen}
                      >
                        <span className="bo-nav__section-label">{section.label}</span>
                        <span className="bo-nav__chevron" aria-hidden="true">›</span>
                      </button>

                      <div className={`bo-nav__section-body ${isOpen ? 'is-open' : ''}`}>
                        {/* grid 0fr→1fr 애니메이션을 위한 단일 래퍼 */}
                        <div className="bo-nav__section-body-inner">
                          {section.items.map((item) =>
                            item.disabled ? (
                              <span key={item.to} className="bo-nav__sub-item bo-nav__sub-item--disabled">
                                {item.label}
                                <span className="bo-nav__badge-soon">준비중</span>
                              </span>
                            ) : (
                              <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                  `bo-nav__sub-item ${isActive ? 'is-active' : ''}`
                                }
                              >
                                {item.label}
                              </NavLink>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <>
                {/* 비로그인 상태: 로그인 / 가입만 표시 */}
                <NavLink
                  to="/backoffice/login"
                  className={({ isActive }) => `bo-nav__item ${isActive ? 'is-active' : ''}`}
                >
                  관리자 로그인
                </NavLink>
                <NavLink
                  to="/backoffice/signup"
                  className={({ isActive }) => `bo-nav__item ${isActive ? 'is-active' : ''}`}
                >
                  관리자 가입
                </NavLink>
              </>
            )}
          </nav>

          {isLoggedIn && (
            <div className="bo-sidebar__bottom">
              <button className="bo-nav__item bo-nav__logout" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          )}
        </aside>

        <main className="bo-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default BackofficeLayout;
