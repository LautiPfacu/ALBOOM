// Puntaje de la comunidad (promedio y cantidad de reseñas) para una lista de discos.
//
//   const stats = useAlbumStats(albums.map((a) => a.id));
//   stats.get(id) → { average, count } | undefined

import { useEffect, useMemo, useState } from 'react';
import { getStatsForAlbums } from '../services/reviews';

const EMPTY = new Map();

export function useAlbumStats(albumIds) {
  // Clave estable a partir de los ids, para no volver a pedir si la lista es la misma.
  const key = useMemo(() => [...new Set(albumIds)].sort().join(','), [albumIds]);
  const [state, setState] = useState({ key: '', stats: EMPTY });

  useEffect(() => {
    if (!key) return undefined;
    let cancelled = false;
    getStatsForAlbums(key.split(','))
      .then((stats) => {
        if (!cancelled) setState({ key, stats });
      })
      // Si falla, simplemente no mostramos puntajes de la comunidad.
      .catch(() => {
        if (!cancelled) setState({ key, stats: EMPTY });
      });
    // Si cambia la lista antes de que llegue la respuesta, ignoramos la vieja.
    return () => {
      cancelled = true;
    };
  }, [key]);

  return state.key === key ? state.stats : EMPTY;
}
