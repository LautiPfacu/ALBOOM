// Discos que la persona marcó como "No me interesa", en tiempo real.
//   const dismissed = useDismissed();  → Set de albumId

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToDismissed } from '../services/profile';

export function useDismissed() {
  const { user } = useAuth();
  const uid = user.uid;
  const [state, setState] = useState({ uid: null, ids: [] });

  // CONSULTAR: users/{uid}/dismissed con onSnapshot. El cleanup corta la suscripción.
  useEffect(() => {
    return subscribeToDismissed(
      uid,
      (ids) => setState({ uid, ids }),
      () => setState({ uid, ids: [] }),
    );
  }, [uid]);

  // El Set se arma solo cuando cambian los datos (no en cada render).
  return useMemo(() => new Set(state.uid === uid ? state.ids : []), [state, uid]);
}
