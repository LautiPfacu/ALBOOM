// Posteos de una o varias personas, de a 20, en tiempo real ("Siguiendo" y "Actividad").
//   const { posts, loading, error, hasMore, loadMore } = usePostsBy(uids);
//
// Para "cargar más" se pide un límite más grande (20, 40, 60…): es simple y, como la consulta
// es en tiempo real, los posteos nuevos aparecen arriba sin recargar.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { subscribeToPostsBy } from '../services/posts';

const PAGE_SIZE = 20;

export function usePostsBy(uids) {
  const uidsKey = [...new Set(uids)].sort().join(',');
  const [max, setMax] = useState(PAGE_SIZE);
  const [state, setState] = useState({ key: null, posts: [], error: null });
  const key = `${uidsKey}|${max}`;

  // Si cambian las personas (por ejemplo, seguís a alguien), volvemos a la primera página.
  const [lastUids, setLastUids] = useState(uidsKey);
  if (lastUids !== uidsKey) {
    setLastUids(uidsKey);
    setMax(PAGE_SIZE);
  }

  useEffect(() => {
    if (!uidsKey) return undefined;
    return subscribeToPostsBy(
      uidsKey.split(','),
      max,
      (posts) => setState({ key, posts, error: null }),
      (error) =>
        setState({
          key,
          posts: [],
          // Si falta el índice compuesto, Firestore lo avisa con failed-precondition.
          error:
            error.code === 'failed-precondition'
              ? 'Falta crear un índice en Firestore (mirá el link en la consola del navegador).'
              : 'No pudimos cargar los posteos.',
        }),
    );
  }, [uidsKey, max, key]);

  const loading = Boolean(uidsKey) && state.key !== key;
  // Mientras carga la página siguiente, seguimos mostrando la anterior.
  const posts = useMemo(() => (state.key?.startsWith(`${uidsKey}|`) ? state.posts : []), [state, uidsKey]);
  const hasMore = !loading && posts.length >= max;
  const loadMore = useCallback(() => setMax((current) => current + PAGE_SIZE), []);

  return {
    posts,
    loading: loading && posts.length === 0,
    loadingMore: loading && posts.length > 0,
    error: state.key === key ? state.error : null,
    hasMore,
    loadMore,
  };
}
