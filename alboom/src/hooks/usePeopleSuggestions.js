// "Gente con tus gustos": personas que no seguís, ordenadas por afinidad con vos.
//   const { people, loading } = usePeopleSuggestions(me, 3);
//   people → [{ ...perfil, reason }]

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFollow } from '../context/FollowContext';
import { getRecentProfiles } from '../services/publicProfile';
import { affinityBetween, affinityReason } from '../utils/affinity';

export function usePeopleSuggestions(me, max = 3) {
  const { user } = useAuth();
  const { followingIds, loading: followLoading } = useFollow();
  const [state, setState] = useState({ key: null, people: [] });

  const key = !followLoading && me ? `${user.uid}|${(me.genres ?? []).join(',')}|${max}` : null;

  useEffect(() => {
    if (!key) return undefined;
    let cancelled = false;
    getRecentProfiles(60)
      .then((profiles) => {
        const scored = profiles
          .filter((p) => p.uid !== user.uid && p.username)
          .map((p) => {
            const affinity = affinityBetween(me, p);
            return { ...p, score: affinity.score, reason: affinityReason(affinity) ?? 'Nuevo en ALBOOM' };
          })
          .sort((a, b) => b.score - a.score || (b.followersCount ?? 0) - (a.followersCount ?? 0));
        if (!cancelled) setState({ key, people: scored });
      })
      .catch(() => !cancelled && setState({ key, people: [] }));
    return () => {
      cancelled = true;
    };
    // `me` ya está representado en `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // A quienes empezás a seguir los sacamos al instante (sin volver a pedir).
  const people = state.people.filter((p) => !followingIds.includes(p.uid)).slice(0, max);
  return { people, loading: !key || state.key !== key };
}
