// 📁 src/components/Footer/Footer.tsx
// 역할: 페이지 하단 푸터 컴포넌트
//       서비스 소개 링크, 저작권 정보 표시

import { useNavigate } from "react-router-dom";
import "./Footer.css";

interface FooterLink {
  id:   string;
  label: string;
  path?: string; // 내부 라우터 경로 (없으면 비활성)
}

const FOOTER_LINKS: FooterLink[] = [
  { id: "about",   label: "서비스 소개" },
  { id: "terms",   label: "이용약관" },
  { id: "privacy", label: "개인정보처리방침" },
  { id: "support", label: "고객센터", path: "/inquiry" },
];

function Footer(): JSX.Element {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        {/* 로고 및 서비스 소개 */}
        <div className="footer__brand">
          <span className="footer__logo">🍽 맛지도</span>
          <p className="footer__tagline">진짜 맛집을 찾는 가장 솔직한 방법</p>
        </div>

        {/* 링크 그룹 */}
        <div className="footer__links">
          {FOOTER_LINKS.map((link: FooterLink) => (
            <span
              key={link.id}
              onClick={() => link.path && navigate(link.path)}
              className={link.path ? "footer__link--active" : ""}
            >
              {link.label}
            </span>
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
