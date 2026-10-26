// Deja pasar solo con sesión. Sin sesión, manda a /login y recuerda de dónde venía.
// Si la persona todavía no terminó la primera vez, la manda a /bienvenida.
// Los invitados no pasan por la primera vez: entran directo a mirar la app.

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FullPageLoader from './FullPageLoader';

export default function ProtectedRoute() {
  const { user, loading, profile, profileLoading, isGuest } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (isGuest) {
    return location.pathname === '/bienvenida' ? <Navigate to="/" replace /> : <Outlet />;
  }
  if (profileLoading) return <FullPageLoader />;

  const onboardingDone = profile?.onboardingDone === true;
  const atWelcome = location.pathname === '/bienvenida';
  if (!onboardingDone && !atWelcome) return <Navigate to="/bienvenida" replace />;
  if (onboardingDone && atWelcome) return <Navigate to="/" replace />;

  return <Outlet />;
}
