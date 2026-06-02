import { useNavigate } from 'react-router-dom';
import type { BackofficeSession } from '@/pages/backoffice/login/types';
import './BackofficeMainPage.css';

const LEVEL_LABEL: Record<number, string> = {
  1: '일반 관리자',
  2: '상위 관리자',
  3: '최고 관리자',
};

function BackofficeMainPage(): JSX.Element {
  const navigate = useNavigate();
  const raw = sessionStorage.getItem('backofficeSession');
  const session: BackofficeSession | null = raw ? JSON.parse(raw) : null;

  const handleLogout = (): void => {
    sessionStorage.removeItem('backofficeSession');
    navigate('/backoffice/login');
  };

  return (
    <div className="bo-main-page">

      {/* 페이지 헤더 */}
      <div className="bo-main-header">
        <div>
          <h2 className="bo-main-title">대시보드</h2>
          <p className="bo-main-subtitle">백오피스 관리 시스템에 오신 것을 환영합니다.</p>
        </div>
        <button className="bo-logout-btn" onClick={handleLogout}>
          로그아웃
        </button>
      </div>

      {/* 로그인 세션 정보 카드 */}
      <div className="bo-session-card">
        <div className="bo-session-card__left">
          <div className="bo-session-avatar">
            {session?.id?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div>
            <p className="bo-session-id">{session?.id ?? '-'}</p>
            <p className="bo-session-time">
              로그인 시각: {session?.loginTime
                ? new Date(session.loginTime).toLocaleString('ko-KR')
                : '-'}
            </p>
          </div>
        </div>
        <span className={`bo-level-badge bo-level-badge--${session?.level ?? 1}`}>
          Lv.{session?.level ?? '-'} &nbsp;{LEVEL_LABEL[session?.level ?? 1] ?? '관리자'}
        </span>
      </div>

      {/* 통계 카드 그리드 (추후 실데이터 연동 예정) */}
      <div className="bo-stat-grid">
        <div className="bo-stat-card">
          <p className="bo-stat-label">전체 회원</p>
          <p className="bo-stat-value">-</p>
          <p className="bo-stat-desc">준비중</p>
        </div>
        <div className="bo-stat-card">
          <p className="bo-stat-label">전체 맛집</p>
          <p className="bo-stat-value">-</p>
          <p className="bo-stat-desc">준비중</p>
        </div>
        <div className="bo-stat-card">
          <p className="bo-stat-label">전체 리뷰</p>
          <p className="bo-stat-value">-</p>
          <p className="bo-stat-desc">준비중</p>
        </div>
        <div className="bo-stat-card">
          <p className="bo-stat-label">신고 접수</p>
          <p className="bo-stat-value">-</p>
          <p className="bo-stat-desc">준비중</p>
        </div>
      </div>

    </div>
  );
}

export default BackofficeMainPage;
