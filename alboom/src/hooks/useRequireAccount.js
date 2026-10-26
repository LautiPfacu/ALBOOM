// Para acciones que necesitan una cuenta (guardar un disco, seguir, dar me gusta…).
//   const requireAccount = useRequireAccount('albums');   // 'albums' | 'other' (texto del pop-up)
//   function handleSave() { if (requireAccount()) return; … }
// Si es un invitado, abre el pop-up para iniciar sesión y devuelve true.

import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGuestGate } from '../context/GuestGateContext';

export function useRequireAccount(kind = 'other') {
  const { isGuest } = useAuth();
  const { openGate } = useGuestGate();

  return useCallback(() => {
    if (!isGuest) return false;
    openGate(kind);
    return true;
  }, [isGuest, openGate, kind]);
}
