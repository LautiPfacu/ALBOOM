// A quién seguís, disponible en toda la app: const { isFollowing, toggleFollow, followingIds } = useFollow();
// Hay una sola suscripción a follows (where follower == vos) para toda la sesión.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { follow, subscribeToFollowing, unfollow } from '../services/follows';
import { writeErrorMessage } from '../services/writes';

const FollowContext = createContext(null);

export function FollowProvider({ children }) {
  const { user } = useAuth();
  const uid = user.uid;
  const { showToast } = useToast();
  const [state, setState] = useState({ uid: null, ids: [] });
  // uids con una operación de seguir/dejar de seguir en curso (para deshabilitar el botón)
  const [pendingIds, setPendingIds] = useState(() => new Set());

  // CONSULTAR: follows donde follower == vos, en tiempo real.
  useEffect(() => {
    return subscribeToFollowing(
      uid,
      (ids) => setState({ uid, ids }),
      () => setState({ uid, ids: [] }),
    );
  }, [uid]);

  const loading = state.uid !== uid;
  const followingIds = useMemo(() => (loading ? [] : state.ids), [loading, state.ids]);
  const followingSet = useMemo(() => new Set(followingIds), [followingIds]);

  const toggleFollow = useCallback(
    async (them, name) => {
      if (them === uid) return;
      const wasFollowing = followingSet.has(them);
      setPendingIds((current) => new Set(current).add(them));
      try {
        // SEGUIR / DEJAR DE SEGUIR: el botón cambia cuando Firestore confirma (por la suscripción).
        if (wasFollowing) await unfollow(uid, them);
        else await follow(uid, them);
        if (!wasFollowing && name) showToast({ type: 'success', message: `Ahora seguís a ${name}.` });
      } catch (error) {
        showToast({ type: 'error', message: writeErrorMessage(error) });
      } finally {
        setPendingIds((current) => {
          const next = new Set(current);
          next.delete(them);
          return next;
        });
      }
    },
    [uid, followingSet, showToast],
  );

  const value = useMemo(
    () => ({
      followingIds,
      loading,
      isFollowing: (them) => followingSet.has(them),
      isPending: (them) => pendingIds.has(them),
      toggleFollow,
    }),
    [followingIds, loading, followingSet, pendingIds, toggleFollow],
  );

  return <FollowContext.Provider value={value}>{children}</FollowContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFollow() {
  const context = useContext(FollowContext);
  if (!context) throw new Error('useFollow tiene que usarse dentro de <FollowProvider>.');
  return context;
}
