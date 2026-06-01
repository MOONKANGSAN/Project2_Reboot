import { NavLink, Outlet } from "react-router-dom";
import "@/layouts/backoffice/backoffice-tokens.css";

function BackofficeLayout(): JSX.Element {
  return (
    <div className="bo-root bo-layout">
      <header className="bo-topbar">
        <div className="bo-topbar__brand">BACKOFFICE</div>
      </header>

      <div className="bo-layout__body">
        <aside className="bo-sidebar" aria-label="Backoffice navigation">
          <nav className="bo-nav">
            <NavLink
              to="/backoffice/signup"
              className={({ isActive }) => (isActive ? "bo-nav__item is-active" : "bo-nav__item")}
            >
              관리자 가입
            </NavLink>
          </nav>
        </aside>

        <main className="bo-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default BackofficeLayout;
