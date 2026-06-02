import { Navigate, Outlet } from 'react-router-dom';

function BackofficeProtectedRoute(): JSX.Element {
  const session = sessionStorage.getItem('backofficeSession');
  if (!session) {
    return <Navigate to="/backoffice/login" replace />;
  }
  return <Outlet />;
}

export default BackofficeProtectedRoute;
