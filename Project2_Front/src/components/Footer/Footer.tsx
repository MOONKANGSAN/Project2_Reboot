// 📁 src/components/Footer/Footer.tsx
// 역할: 페이지 하단 푸터 컴포넌트
//       서비스 소개 링크, 저작권 정보 표시
//       props 없는 순수 표시 컴포넌트이므로 반환 타입만 JSX.Element로 명시
//       추후 약관, 개인정보처리방침 링크 연결 예정

import "./Footer.css";

// 푸터 링크 데이터 타입 - 추후 href 필드 추가 예정
interface FooterLink {
  id: string;
  label: string;
}

// 푸터 링크 목록 - FooterLink[] 타입으로 구조 보장
const FOOTER_LINKS: FooterLink[] = [
  { id: "about",   label: "서비스 소개" },
  { id: "terms",   label: "이용약관" },
  { id: "privacy", label: "개인정보처리방침" },
  { id: "support", label: "고객센터" },
];

function Footer(): JSX.Element {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        {/* 로고 및 서비스 소개 */}
        <div className="footer__brand">
          <span className="footer__logo">🍽 맛지도</span>
          <p className="footer__tagline">진짜 맛집을 찾는 가장 솔직한 방법</p>
        </div>

        {/* 링크 그룹 - 추후 실제 페이지 연결 예정 */}
        <div className="footer__links">
          {FOOTER_LINKS.map((link: FooterLink) => (
            <span key={link.id}>{link.label}</span>
          ))}
        </div>

        {/* 저작권 */}
        <p className="footer__copyright">
          © 2025 맛지도. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;