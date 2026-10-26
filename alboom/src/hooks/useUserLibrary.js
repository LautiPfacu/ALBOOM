// Biblioteca de otra persona (para la pestaña "Biblioteca" de su perfil).
// Para tu propia biblioteca usá useLibrary(), que ya tiene la suscripción de la sesión.
//   const { items, loading, error } = useUserLibrary(uid);

import { useEffect, useState } from 'react';
import { subscribeToLibrary } from '../services/library';

export function useUserLibrary(uid) {
  const [state, setState] = useState({ uid: null, items: [], error: null });

  // CONSULTAR: users/{uid}/library (las reglas dejan leerla a cualquiera con sesión).
  useEffect(() => {
    if (!uid) return undefined;
    return subscribeToLibrary(
      uid,
      (items) => setState({ uid, items, error: null }),
      () => setState({ uid, items: [], error: 'No pudimos cargar su biblioteca.' }),
    );
  }, [uid]);

  const loading = Boolean(uid) && state.uid !== uid;
  return { items: loading ? [] : state.items, loading, error: loading ? null : state.error };
}
