// Perfil público de una persona, en tiempo real.
//   const { profile, loading, error } = usePublicProfile(uid);   profile === null → no existe

import { useEffect, useState } from 'react';
import { subscribeToPublicProfile } from '../services/publicProfile';

export function usePublicProfile(uid) {
  const [state, setState] = useState({ uid: null, profile: null, error: null });

  // CONSULTAR: profiles/{uid} con onSnapshot. El cleanup corta la suscripción.
  useEffect(() => {
    if (!uid) return undefined;
    return subscribeToPublicProfile(
      uid,
      (profile) => setState({ uid, profile, error: null }),
      () => setState({ uid, profile: null, error: 'No pudimos cargar este perfil.' }),
    );
  }, [uid]);

  const loading = Boolean(uid) && state.uid !== uid;
  return { profile: loading ? null : state.profile, loading, error: loading ? null : state.error };
}
