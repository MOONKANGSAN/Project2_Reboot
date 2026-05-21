// 📁 src/pages/NotFoundPage.tsx
// 역할: 404 페이지 컴포넌트
//       존재하지 않는 경로로 접근했을 때 표시되는 페이지
//       사용자를 홈으로 안내하는 버튼 포함

import { useNavigate } from 'react-router-dom';
import './NotFoundPage.css';

// ─────────────────────────────────────────
// 페이지 컴포넌트
// ─────────────────────────────────────────

function NotFoundPage(): JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        {/* 404 타이틀 */}
        <div className="not-found-code">404</div>

        {/* 에러 메시지 */}
        <h1 className="not-found-title">페이지를 찾을 수 없습니다</h1>
        <p className="not-found-description">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>

        {/* 홈으로 돌아가기 버튼 */}
        <button
          className="not-found-button"
          onClick={() => navigate('/')}
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default NotFoundPage;