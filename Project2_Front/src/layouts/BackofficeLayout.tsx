import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "@/layouts/backoffice/backoffice-tokens.css";

function BackofficeLayout(): JSX.Element {
  const navigate = useNavigate();
  const isLoggedIn = !!sessionStorage.getItem('backofficeSession');

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
        <aside className="bo-sidebar" aria-label="Backoffice navigation">
          <nav className="bo-nav">
            {isLoggedIn && (
              <NavLink
                to="/backoffice/main"
                className={({ isActive }) => (isActive ? "bo-nav__item is-active" : "bo-nav__item")}
              >
                대시보드
              </NavLink>
            )}
            {isLoggedIn && (
              <NavLink
                to="/backoffice/restaurant/register"
                className={({ isActive }) => (isActive ? "bo-nav__item is-active" : "bo-nav__item")}
              >
                점포 등록
              </NavLink>
            )}
            <NavLink
              to="/backoffice/login"
              className={({ isActive }) => (isActive ? "bo-nav__item is-active" : "bo-nav__item")}
            >
              관리자 로그인
            </NavLink>
            <NavLink
              to="/backoffice/signup"
              className={({ isActive }) => (isActive ? "bo-nav__item is-active" : "bo-nav__item")}
            >
              관리자 가입
            </NavLink>
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
