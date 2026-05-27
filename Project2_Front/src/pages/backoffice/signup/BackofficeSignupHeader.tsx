// 📁 src/pages/backoffice/signup/BackofficeSignupHeader.tsx
// 역할: 가입 카드 상단 헤더 UI 컴포넌트
//       BACKOFFICE 뱃지, 타이틀, 서브타이틀 표시
//       props 없는 순수 표시 컴포넌트

function BackofficeSignupHeader(): JSX.Element {
    return (
      <div className="bo-signup-header">
        {/* 관리자 페이지임을 명확히 구분하는 뱃지 */}
        <div className="bo-signup-badge">BACKOFFICE</div>
        <h1 className="bo-signup-title">관리자 계정 생성</h1>
        <p className="bo-signup-subtitle">백오피스 접근 권한이 있는 관리자만 사용하세요</p>
      </div>
    );
  }
  
  export default BackofficeSignupHeader;