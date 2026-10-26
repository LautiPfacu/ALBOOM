// Rutas que necesitan una cuenta de verdad (tu perfil, perfiles de otras personas, ajustes).
// Un invitado que entra acá va a la pantalla de crear cuenta, y después vuelve a donde quería ir.

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AccountRoute() {
  const { isGuest } = useAuth();
  const location = useLocation();

  if (isGuest) return <Navigate to="/login" replace state={{ from: location, mode: 'register' }} />;
  return <Outlet />;
}
