// Tendencias: los 5 discos con más reseñas en los últimos 7 días.
//   const { trends, loading } = useTrends();

import { useEffect, useState } from 'react';
import { getWeeklyTrends } from '../services/reviews';

export function useTrends() {
  const [state, setState] = useState({ loading: true, trends: [] });

  useEffect(() => {
    let cancelled = false;
    getWeeklyTrends()
      .then((trends) => {
        if (!cancelled) setState({ loading: false, trends });
      })
      // Sin datos (o si falla) la sección se oculta.
      .catch(() => {
        if (!cancelled) setState({ loading: false, trends: [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
