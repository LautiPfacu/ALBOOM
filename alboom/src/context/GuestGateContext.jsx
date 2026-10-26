// Pop-up para invitados: cuando quieren guardar, reseñar, seguir… les ofrece iniciar sesión.
// Lo abre useRequireAccount(); acá solo vive el estado y el diálogo.

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';

const GuestGateContext = createContext(null);

const TITLES = {
  albums: 'Para guardar y reseñar discos tenés que iniciar sesión.',
  other: 'Para hacer esto tenés que iniciar sesión.',
};

export function GuestGateProvider({ children }) {
  const [kind, setKind] = useState(null); // null = cerrado
  const navigate = useNavigate();
  const location = useLocation();

  const openGate = useCallback((nextKind) => setKind(nextKind), []);
  const close = useCallback(() => setKind(null), []);

  function goToLogin() {
    setKind(null);
    navigate('/login', { state: { from: location, mode: 'login' } });
  }

  const value = useMemo(() => ({ openGate }), [openGate]);

  return (
    <GuestGateContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={kind !== null}
        title={TITLES[kind] ?? TITLES.other}
        text="¿Querés iniciar sesión?"
        cancelLabel="Ahora no"
        confirmLabel="Ir a iniciar sesión"
        confirmVariant="primary"
        onConfirm={goToLogin}
        onCancel={close}
      />
    </GuestGateContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGuestGate() {
  return useContext(GuestGateContext);
}
