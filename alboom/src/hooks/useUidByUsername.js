// "@lucia.vinilos" → uid, usando la reserva usernames/{username}.
//   const { uid, loading, notFound } = useUidByUsername(username);

import { useEffect, useState } from 'react';
import { getUidByUsername } from '../services/publicProfile';

export function useUidByUsername(username) {
  const [state, setState] = useState({ username: null, uid: null, error: null });

  useEffect(() => {
    let cancelled = false;
    getUidByUsername(username)
      .then((uid) => !cancelled && setState({ username, uid, error: null }))
      .catch(() => !cancelled && setState({ username, uid: null, error: 'No pudimos cargar este perfil.' }));
    // Si cambia el usuario antes de la respuesta, ignoramos la vieja.
    return () => {
      cancelled = true;
    };
  }, [username]);

  const loading = state.username !== username;
  return {
    uid: loading ? null : state.uid,
    loading,
    notFound: !loading && !state.uid && !state.error,
    error: loading ? null : state.error,
  };
}
