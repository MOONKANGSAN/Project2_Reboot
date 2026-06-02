// 📁 src/pages/backoffice/login/BackofficeLoginHeader.tsx
// 역할: 로그인 페이지 헤더
//       BACKOFFICE 뱃지, 타이틀, 서브타이틀 표시

function BackofficeLoginHeader(): JSX.Element {
    return (
      <div className="bo-login-header">
        {/* 관리자 페이지임을 명확히 구분하는 뱃지 */}
        <div className="bo-login-badge">BACKOFFICE</div>
        <h1 className="bo-login-title">관리자 로그인</h1>
        <p className="bo-login-subtitle">백오피스 관리자 계정으로 로그인하세요</p>
      </div>
    );
  }
  
  export default BackofficeLoginHeader;