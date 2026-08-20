// 📁 src/layouts/PublicProtectedRoute.tsx
// 역할: userSession이 없는 비로그인 사용자를 홈으로 리다이렉트하는 보호 라우트
//       로그인이 필요한 공개 페이지(프로필 등)에 사용

import { Navigate, Outlet } from 'react-router-dom';

function PublicProtectedRoute(): JSX.Element {
  const session = sessionStorage.getItem('userSession');
  if (!session) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

export default PublicProtectedRoute;
