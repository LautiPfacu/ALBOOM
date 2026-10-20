// Deja pasar solo sin sesión (el login). Con sesión, vuelve a la página de la que venía o a "/".
// Por eso LoginPage no necesita navegar: cuando Firebase confirma el login, este componente redirige.

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FullPageLoader from './FullPageLoader';

export default function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;
  if (user) return <Navigate to={location.state?.from ?? '/'} replace />;
  return <Outlet />;
}
