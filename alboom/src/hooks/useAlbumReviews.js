// Reseñas públicas de un disco en tiempo real, con promedio y distribución.
//   const { reviews, summary, loading, error } = useAlbumReviews(albumId);
//   summary → { count, average, distribution: [10 números, de ½ a 5] }

import { useEffect, useMemo, useState } from 'react';
import { subscribeToAlbumReviews, summarizeReviews } from '../services/reviews';

export function useAlbumReviews(albumId) {
  const [state, setState] = useState({ albumId: null, reviews: [], error: null });

  // CONSULTAR: onSnapshot de reviews donde albumId == id. El cleanup corta la suscripción.
  useEffect(() => {
    return subscribeToAlbumReviews(
      albumId,
      (reviews) => setState({ albumId, reviews, error: null }),
      () => setState({ albumId, reviews: [], error: 'No pudimos cargar las reseñas.' }),
    );
  }, [albumId]);

  const loading = state.albumId !== albumId;
  const reviews = useMemo(() => (loading ? [] : state.reviews), [loading, state.reviews]);
  const summary = useMemo(() => summarizeReviews(reviews), [reviews]);

  return { reviews, summary, loading, error: loading ? null : state.error };
}
