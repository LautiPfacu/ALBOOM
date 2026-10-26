// Reseñas públicas de una persona, de la más nueva a la más vieja, con su promedio.
//   const { reviews, average, loading, error } = useUserReviews(uid);

import { useEffect, useMemo, useState } from 'react';
import { subscribeToUserReviews } from '../services/reviews';

const millis = (value) => (typeof value?.toMillis === 'function' ? value.toMillis() : 0);

export function useUserReviews(uid) {
  const [state, setState] = useState({ uid: null, reviews: [], error: null });

  // CONSULTAR: reviews donde uid == …, en tiempo real. El cleanup corta la suscripción.
  useEffect(() => {
    if (!uid) return undefined;
    return subscribeToUserReviews(
      uid,
      (reviews) => setState({ uid, reviews, error: null }),
      () => setState({ uid, reviews: [], error: 'No pudimos cargar las reseñas.' }),
    );
  }, [uid]);

  const loading = Boolean(uid) && state.uid !== uid;
  const reviews = useMemo(
    () => (loading ? [] : [...state.reviews].sort((a, b) => millis(b.createdAt) - millis(a.createdAt))),
    [loading, state.reviews],
  );
  const average = useMemo(
    () => (reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0),
    [reviews],
  );

  return { reviews, average, loading, error: loading ? null : state.error };
}
